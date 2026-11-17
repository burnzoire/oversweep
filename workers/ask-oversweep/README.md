# Ask Oversweep deployment

The deployment workflow builds the site and bundles its passage corpus into the Worker. The site sends section IDs, the question, and the previous topic. Run the Worker deployment after site content changes to refresh the bundled corpus.

After approval and merge, run **Deploy Ask Oversweep Worker** from Actions. It uses the existing `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` variable. Set the repository variable `PUBLIC_ASK_ENDPOINT` to `https://ask-oversweep.burnzoire.workers.dev/ask` and rerun the Pages deployment to activate generated replies. Builds with no endpoint use Pagefind alone.

Ask “What is the tower freq for Sochi?” after deployment. The cited Sim maps passage should support 127.0 MHz VHF and 256.0 MHz UHF for DCS: Caucasus. The Worker defaults to Granite 4.0 H Micro. Set the optional Worker variable `ASK_MODEL` to compare another free-tier model.

Run the handler tests with `node --test tests/ask/worker.test.mjs`. These tests simulate the Workers AI binding.
