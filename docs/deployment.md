# Deployment: GitHub Pages

Status: GitHub Pages replaced the Windows 11 Docker proposal at the owner's request
on 22 October 2026. PR #27 configured the push-to-main workflow, and the latest
observed main deployment succeeded at SHA `72ad6cb` (see
[run evidence](progress.md)). A successful run does not establish live-site
reachability or a content release. Repository Pages settings and account eligibility
are not exposed by the current settings connector and remain unverified.

## Delivery

Use static Astro output on GitHub Pages. No Docker image, GHCR package, private
server or self-hosted runner is needed. The intended model keeps the source
repository private and serves the website publicly when Pages settings and account
eligibility permit it. Verify access in Settings; do not make the repository public
to work around unavailable Pages.

The [Pages workflow](../.github/workflows/pages.yml) runs automatically on every
push to main, including merged PRs. Manual dispatch from main remains available.
Merging a PR therefore initiates publication after the workflow's checks pass.
Other branches are skipped, and PRs receive no deployment permissions or public previews.

The build job uses a GitHub-hosted Linux runner, Node 22, the committed npm lockfile,
foundation checks and the application's required `npm run check`. It then removes
previous output and builds Astro for the URL returned by configure-pages. Only
`dist/` is uploaded; never upload the repository, documentation or a development
preview build. The deploy job alone receives Pages write and OIDC permissions.
Actions are pinned to commit SHAs; releases are serialized without cancellation.

## Application integration contract

The site PR provides `package-lock.json`, `astro.config.mjs`, static output to
`dist/`, and `npm run check` for type and generated-site validation. Future
experience work must extend the production checks to fail closed on invalid content
and exclude unapproved experiences and assets.

Astro receives `--site` and `--base` from Pages metadata. Default project hosting
uses `https://burnzoire.github.io/oversweep/` with base `/oversweep`; a configured
custom domain uses its origin and root base. Use `import.meta.env.BASE_URL` for
internal navigation, public assets, fetch URLs and search paths. Astro does not
rewrite hard-coded root-relative links automatically.

Test the production build at both `/oversweep/` and `/`: direct nested navigation,
refresh, images, JS hydration, trainer/debrief, search and 404 behavior. Pages
serves static files and has no application-server fallback. Generate real routes;
do not rely on an SPA rewrite. Verify production output excludes source-gated
content. The successful deployment job is not a substitute for these live checks.

## Settings, live verification and domain setup

1. In repository **Settings → Pages**, verify **GitHub Actions** as the source,
   account eligibility and the `github-pages` environment's main-only branch
   policy. The current connector cannot inspect or change these settings.
2. After a push to main (or an explicitly authorised manual dispatch), check both
   build/deploy jobs and use the deployment URL reported by the run. The latest
   observed main run succeeded, but the URL and live behavior still need verification.
3. Once the intended spelling is confirmed, set the custom domain in Pages
   settings, for example `www.oversweep.com`. The owner's message said
   `www.oversleep.com`; no domain has been set on that assumption.
4. Set DNS record `CNAME www → burnzoire.github.io` at the DNS provider.
   The target excludes `https://` and `/oversweep/`. Configure the domain in
   GitHub before changing DNS. A CNAME file is unnecessary for Actions publishing.
5. Run the workflow again to rebuild using custom-domain metadata. After DNS and
   certificate provisioning complete, enable **Enforce HTTPS** and check the
   site, nested routes and assets at the custom domain.

DNS changes remain owner-managed. No DNS credentials, PAT or custom deployment
secret is required by this workflow. Domain verification through GitHub is
recommended before binding the custom domain.

## Release verification and rollback

Record the workflow run URL, source SHA, deployed URL and observed smoke-test
results. Confirm the homepage, nested references, experience entry points,
hydration and content exclusion through the live URL. A successful deployment
job alone does not establish application behavior or aviation validity.

To roll back, revert the offending application change through a reviewed PR,
merge it, and the push to main automatically deploys the reverted version. Do not dispatch an arbitrary
branch or assume that rerunning an old job restores the current domain setup.
Keep the prior successful run/commit recorded. Publication requirements in
[content standards](content-standards.md) still apply.

## Primary documentation

Checked 22 October 2026.

- [GitHub Pages custom workflows and plan availability](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Custom domain and DNS setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Astro on GitHub Pages and base paths](https://docs.astro.build/en/guides/deploy/github/)
