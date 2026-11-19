// Private report store and review page. Report text is untrusted: always escaped.
const schema = `CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL)`;

export async function saveReport(env, report) {
  if (!env.DB) return;
  try {
    await env.DB.prepare(schema).run();
    await env.DB.prepare("INSERT INTO reports (data) VALUES (?)").bind(JSON.stringify(report)).run();
  } catch (error) {
    console.warn("ask_oversweep_report_store_failed", { message: String(error?.message ?? error) });
  }
}

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

async function authorised(request, env) {
  const password = env.ADMIN_PASSWORD;
  if (!password) return false;
  const given = (request.headers.get("Authorization") ?? "").replace(/^Basic /, "");
  let supplied = "";
  try { supplied = atob(given).split(":").slice(1).join(":"); } catch { return false; }
  const digest = async text => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  const [a, b] = await Promise.all([digest(supplied), digest(password)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const page = (body, status = 200) => new Response(body, { status, headers: {
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'",
  } });
  if (!(await authorised(request, env))) {
    return new Response("Authentication required", { status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Ask Oversweep reports"', "Cache-Control": "no-store" } });
  }
  if (!env.DB) return page("<p>No D1 database bound.</p>", 503);
  await env.DB.prepare(schema).run();
  if (request.method === "POST") {
    if (request.headers.get("Origin") !== url.origin) return page("Forbidden", 403);
    const form = await request.formData();
    const id = Number(form.get("id"));
    if (Number.isInteger(id)) {
      if (form.get("action") === "delete") await env.DB.prepare("DELETE FROM reports WHERE id = ?").bind(id).run();
      else await env.DB.prepare("UPDATE reports SET resolved = 1 - resolved WHERE id = ?").bind(id).run();
    }
    return Response.redirect(url.origin + url.pathname, 303);
  }
  if (request.method !== "GET") return page("Method not allowed", 405);
  const { results } = await env.DB.prepare(
    "SELECT id, created_at, resolved, data FROM reports ORDER BY resolved, id DESC LIMIT 200").all();
  const rows = results.map(row => {
    let r = {};
    try { r = JSON.parse(row.data); } catch {}
    const turns = (r.history ?? []).map(t => `<li><b>${esc(t.role)}:</b> ${esc(t.content)}</li>`).join("");
    return `<article class="${row.resolved ? "done" : ""}"><header>#${row.id} · ${esc(row.created_at)} UTC · ${esc(r.stage)} · rev ${esc((r.revision ?? "").slice(0, 7))}</header>
<p><b>Question:</b> ${esc(r.question)}</p><p><b>Reply:</b> ${esc(r.answer)}</p>
<p><b>Sources:</b> ${(r.sources ?? []).map(esc).join(", ") || "none"}</p>
${turns ? `<details><summary>Earlier messages</summary><ul>${turns}</ul></details>` : ""}
<form method="post"><input type="hidden" name="id" value="${row.id}">
<button>${row.resolved ? "Reopen" : "Mark resolved"}</button>
<button name="action" value="delete">Delete</button></form></article>`;
  }).join("");
  return page(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Ask Oversweep reports</title>
<style>body{font:16px system-ui;max-width:48rem;margin:1rem auto;padding:0 1rem}article{border:1px solid #888;border-radius:6px;padding:.5rem 1rem;margin:1rem 0}article.done{opacity:.55}header{font-size:.85rem;color:#666}p{white-space:pre-wrap}button{margin-right:.5rem}</style>
<h1>Ask Oversweep reports</h1><p>${results.length} shown, unresolved first.</p>${rows || "<p>No reports yet.</p>"}`);
}
