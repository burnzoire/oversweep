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
time. It searches the previous 48 hours. When the report records the public
quotation notice, the collector checks the entire question against supported
question forms and public subject names before quoting it verbatim. Older
reports and questions that do not pass the check use the synthetic path.
The collector files a synthetic question only when offline replay selects the
same first passage for both questions, or both return no passages. Unmatched
reports are counted in the run summary for manual review.
Replay checks retrieval against the current corpus. It cannot verify the original
generated answer or recreate browser search hints. The workflow makes no AI calls.

Issues contain the original or synthetic question, public references when
available, response stage and
a signed-in Cloudflare dashboard link with a timestamp and event ID when available.
Use the metadata to locate the event in Workers Observability while it is still
retained. Prior visitor messages and bot replies stay in Cloudflare.
Keep the issue's hidden report
marker and label so that overlapping runs skip issues already created. Each run
opens up to 20 issues. If the run reports deferred events, rerun with backfill
and publishing enabled to process another batch within the retention window.

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
