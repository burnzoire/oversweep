# Deployment: GitHub Pages

Status: GitHub Pages replaces the Windows 11 Docker hosting proposal at the owner's
request on 22 October 2026. The workflow is configured in this PR; no site has been
published and repository Pages settings/account entitlement have not been verified.
The application scaffold is being developed separately in PR #21.

## Delivery

Use static Astro output on GitHub Pages. No Docker image, GHCR package, private
server or self-hosted runner is needed. The repository stays private; the deployed
website is public. A personal private repository requires GitHub Pro (or another
eligible plan); do not make the repository public to work around unavailable Pages.

The [Pages workflow](../.github/workflows/pages.yml) is manually dispatched from
main. Merging a PR does not publish anything. An owner-invoked dispatch is the
release action; do not invoke it as part of feature work. Other branches are
skipped, and PRs receive no deployment permissions or public previews.

The build job uses a GitHub-hosted Linux runner, Node 22, the committed npm lockfile,
foundation checks and the application's required `npm run check`. It then removes
previous output and builds Astro for the URL returned by configure-pages. Only
`dist/` is uploaded; never upload the repository, documentation or a development
preview build. The deploy job alone receives Pages write and OIDC permissions.
Actions are pinned to commit SHAs; releases are serialized without cancellation.

## Application integration contract

The first-slice PR must provide `package-lock.json`, `astro.config.mjs`, static
output to `dist/`, and `npm run check` covering types, registry/content publication
exclusion and model tests. Production build must fail on invalid content and
exclude unapproved experiences and assets. The workflow fails clearly until the
scaffold is merged; it does not publish a placeholder from repository files.

Astro receives `--site` and `--base` from Pages metadata. Default project hosting
uses `https://burnzoire.github.io/oversweep/` with base `/oversweep`; a configured
custom domain uses its origin and root base. Use `import.meta.env.BASE_URL` for
internal navigation, public assets, fetch URLs and search paths. Astro does not
rewrite hard-coded root-relative links automatically.

Before the first release, test the production build at both `/oversweep/` and
`/`: direct nested navigation, refresh, images, JS hydration, trainer/debrief,
search and 404 behavior. Pages serves static files and has no application-server
fallback. Generate real routes; do not rely on an SPA rewrite. Verify production
output excludes source-gated content. The separate scaffold PR has not been
validated with this workflow.

## First release and domain setup

1. Merge the application scaffold and this configuration after review. Confirm
   an eligible GitHub plan and the production content/build checks.
2. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
   The current connector cannot change Pages settings. Review the
   `github-pages` environment's branch policy to allow main only; optional
   reviewer gates depend on plan availability and are not claimed here.
3. In **Actions → Deploy GitHub Pages → Run workflow**, select main. Check the
   build/deploy jobs and use the deployment URL reported by the run. Initially
   expect `https://burnzoire.github.io/oversweep/`; it is not a live URL yet.
4. Once the intended spelling is confirmed, set the custom domain in Pages
   settings, for example `www.oversweep.com`. The owner's message said
   `www.oversleep.com`; no domain has been set on that assumption.
5. Set DNS record `CNAME www → burnzoire.github.io` at the DNS provider.
   The target excludes `https://` and `/oversweep/`. Configure the domain in
   GitHub before changing DNS. A CNAME file is unnecessary for Actions publishing.
6. Run the workflow again to rebuild using custom-domain metadata. After DNS and
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
merge it, then dispatch the workflow on main. Do not dispatch an arbitrary
branch or assume that rerunning an old job restores the current domain setup.
Keep the prior successful run/commit recorded. Publication requirements in
[content standards](content-standards.md) still apply.

## Primary documentation

Checked 22 October 2026.

- [GitHub Pages custom workflows and plan availability](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Custom domain and DNS setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Astro on GitHub Pages and base paths](https://docs.astro.build/en/guides/deploy/github/)
