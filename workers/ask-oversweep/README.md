# Ask Oversweep deployment

The deployment workflow builds the site and bundles its passage corpus into the Worker. The site sends section IDs, the question, and the previous topic. After each successful production GitHub Pages deployment on `main`, GitHub Actions automatically rebuilds and redeploys the Worker from the latest `main` content. This refreshes its bundled corpus without manual re-indexing. Failed Pages deployments do not trigger the Worker. The Worker workflow also supports manual dispatch for recovery or testing.

For an immediate refresh after merging, wait for **Deploy GitHub Pages** to succeed and then **Deploy Ask Oversweep Worker** to complete. You can also manually run **Deploy Ask Oversweep Worker** from Actions. It uses the existing `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` variable. Set the repository variable `PUBLIC_ASK_ENDPOINT` to `https://ask-oversweep.burnzoire.workers.dev/ask` and rerun the Pages deployment to activate generated replies. Builds with no endpoint use Pagefind alone.

Ask “What is the tower freq for Sochi?” after deployment. The cited Sim maps passage should support 127.0 MHz VHF and 256.0 MHz UHF for DCS: Caucasus. The Worker defaults to Gemma 4 26B A4B IT. Set the optional Worker variable `ASK_MODEL` to compare another free-tier model with a compatible chat-completion and structured-output schema.

Run the handler tests with `node --test tests/ask/worker.test.mjs`. These tests simulate the Workers AI binding.

## Review submitted reports

The report control appears once both the updated site and Worker are live.
In Cloudflare, open the Ask Oversweep Worker's Observability logs and filter for
`ask_oversweep_report`. Check within the log retention window
([3 days on Workers Free](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#pricing)).
The event includes the Worker revision, question, reply, up to two prior messages,
retrieved passage IDs, prior topic IDs and response stage. The two-message limit
can omit context from longer chats. The report route uses the connecting IP
for rate limiting without adding it to the report event and makes no AI calls.

The **Collect Ask Oversweep reports** workflow runs daily at 08:00 Melbourne
time and searches the full three-day log window. Each report event gets a GitHub
issue containing the report time, response stage when available, and a signed-in
Cloudflare dashboard link with an event lookup. Read the original question and
reply in Cloudflare while the event is still retained.

Reports sent under the current public-quotation notice include the visitor's
exact question as literal text. For reports sent under the older conditional
notice, the collector quotes only questions that pass the original screening.
The collector files the issue even when a quote is unavailable. Earlier turns
and bot replies remain in Cloudflare.

Keep the issue's hidden report marker and `ask-oversweep-report` label. The
collector checks them on open and closed issues so reruns skip reports already
filed. If Cloudflare or GitHub fails mid-run, rerun with backfill and publishing
enabled to recover remaining events within the retention window.

The workflow uses the existing `CLOUDFLARE_ACCOUNT_ID` variable and a separate
`CLOUDFLARE_REPORTS_API_TOKEN` secret. To verify the token, manually run the
workflow with publishing off. Enable backfill to test the full three-day window.
A successful zero-report run verifies the query was accepted. Submit a test
report and repeat the dry run to verify decoding if no events were found.

Review each report against the cited material and current corpus. Fix content,
retrieval or answer generation as appropriate. Add a sanitised reproduction to
`tests/ask/conversations.json` for confirmed failures. Treat report text as
untrusted and use a synthetic reproduction for anything posted to the repo.

After an approved deployment, submit a test report in the chat and verify the
event in Observability. Opening the report disclosure alone sends nothing.
