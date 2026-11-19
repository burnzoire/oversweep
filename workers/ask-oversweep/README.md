# Ask Oversweep deployment

The deployment workflow builds the site and bundles its passage corpus into the Worker. The site sends section IDs, the question, and the previous topic. After each successful production GitHub Pages deployment on `main`, GitHub Actions automatically rebuilds and redeploys the Worker from the latest `main` content. This refreshes its bundled corpus without manual re-indexing. Failed Pages deployments do not trigger the Worker. The Worker workflow also supports manual dispatch for recovery or testing.

For an immediate refresh after merging, wait for **Deploy GitHub Pages** to succeed and then **Deploy Ask Oversweep Worker** to complete. You can also manually run **Deploy Ask Oversweep Worker** from Actions. It uses the existing `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` variable. Set the repository variable `PUBLIC_ASK_ENDPOINT` to `https://ask-oversweep.burnzoire.workers.dev/ask` and rerun the Pages deployment to activate generated replies. Builds with no endpoint use Pagefind alone.

Ask “What is the tower freq for Sochi?” after deployment. The cited Sim maps passage should support 127.0 MHz VHF and 256.0 MHz UHF for DCS: Caucasus. The Worker defaults to Gemma 4 26B A4B IT. Set the optional Worker variable `ASK_MODEL` to compare another free-tier model with a compatible chat-completion and structured-output schema.

Run the handler tests with `node --test tests/ask/worker.test.mjs`. These tests simulate the Workers AI binding.

## Report dashboard

Reports are also stored in a D1 database (`ask-oversweep-reports`, created automatically on the next deploy) and listed at `https://ask-oversweep.burnzoire.workers.dev/admin/reports`. The page is protected by HTTP Basic auth: any username, with the Worker secret `ADMIN_PASSWORD` as the password. Without that secret the page always returns 401.

One-time setup: in Cloudflare open Workers & Pages → `ask-oversweep` → Settings → Variables and Secrets → Add, type **Secret**, name `ADMIN_PASSWORD`, value a long random password (a password manager's generator is fine), then Deploy. Deploys keep the secret. After the next **Deploy Ask Oversweep Worker** run, submit a test report and open the page. Cloudflare Access is not used because it can only protect a whole `workers.dev` hostname, which would block the public `/ask` route; it becomes an option if the Worker moves to a custom domain.

## Review submitted reports (logs)

The report control appears once both the updated site and Worker are live.
In Cloudflare, open the Ask Oversweep Worker's Observability logs and filter for
`ask_oversweep_report`. Check within the log retention window
([3 days on Workers Free](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#pricing)).
The event includes the Worker revision, question, reply, up to two prior messages,
retrieved passage IDs, prior topic IDs and response stage. The two-message limit
can omit context from longer chats. The report route uses the connecting IP
for rate limiting without adding it to the report event and makes no AI calls.

Review each report against the cited material and current corpus. Fix content,
retrieval or answer generation as appropriate. Add a sanitised reproduction to
`tests/ask/conversations.json` for confirmed failures. Treat report text as
untrusted and remove personal details before copying anything into the repo.

After an approved deployment, submit a test report in the chat and verify the
event in Observability. Opening the report disclosure alone sends nothing.
