# Deployment proposal: GitHub Actions to private Windows Docker host

Status: Proposed delivery mechanism. Product-owner constraints: GitHub Actions
(GHA), an existing private server running Windows 11 with Docker, and intended
domain oversweep.com. No server connection, workflow, credentials, registry package,
runner, ingress or deployment has been configured by this planning task.

## Recommendation

Build and test on GitHub-hosted Linux runners, package the selected site's output
as a Linux container image and store an immutable release in private GHCR.
Promote an explicitly approved image digest to Docker Compose on the private host.
Keep source builds and PR execution away from that host.

For the first deployment, recommend an owner-invoked host-side pull/recreate
operation. This gives a small, reviewable baseline without a persistent Actions
runner on the server. Once unattended delivery is wanted, assess a dedicated
deploy-only self-hosted runner executing trusted release jobs. The image/digest
contract remains the same whichever transport is selected. This is a recommendation,
not permission to publish an image or deploy.

Assumption: Docker on this Windows 11 host can run Linux containers, likely through
Docker Desktop/WSL 2. That setup, CPU architecture and unattended startup are not
verified. Native Windows containers would need a different image/runtime decision.
For a static build, the image can serve compiled files through a small web server;
if the accepted stack needs a runtime, revise the image and health-check contract.

## Delivery options

| Mechanism | Benefits | Costs / decision |
| --- | --- | --- |
| GHA builds private GHCR image; owner pulls approved digest on host | Small initial setup; no inbound management access or general CI runner on server | Manual release action; recommended initial baseline |
| GHA builds image; dedicated self-hosted deployment runner pulls digest | Automated delivery using outbound GitHub connectivity; no public SSH required | Runner executes commands with Docker/host authority; isolate and restrict to trusted release workflows |
| GitHub-hosted deploy job reaches host through private network/SSH | No persistent Actions runner on host | Adds network, key and Windows remote-management setup; assess only if such access already exists |

Do not auto-update a mutable latest tag or install a polling updater that silently
bypasses explicit release approval. No custom orchestration service is needed.
A self-hosted runner is an optional delivery executor, never the PR build runner.
Labels alone are routing, not an access-control boundary: assess repository/write
access, runner groups where supported and workflow-edit permissions. Use a separate
deployment repository/runner boundary if required to enforce that separation.
Windows runners can execute Docker CLI commands, but Docker container actions and
Actions service containers require a Linux runner; do not assume a native Windows
runner supports those job features.

## Proposed release contract

1. Validate the approved commit using the required tests, build and content gates.
   PR validation does not receive registry-push or production access.
2. With explicit release/build authorisation, build once on a trusted GitHub-hosted
   runner. Use narrowly scoped workflow permissions: contents read and packages
   write only in the publishing job. Use GITHUB_TOKEN for that job, pin actions
   and base images, record source commit, workflow run and resulting image digest.
3. Keep the GHCR package private and verify access settings independently of the
   repository's visibility. The host uses a separately stored read:packages
   credential for private pulls; no source-write or package-write credential is
   needed for the host. Keep credentials out of Compose files and logs.
4. Record human approval of the exact digest and target. Use environment approval
   rules if supported by the account/private-repository plan. GitHub limits these
   features by plan; do not claim a required-reviewer gate exists without checking.
   If unavailable, keep owner-invoked promotion with approval recorded in the issue.
5. Pull that digest, retain the previous release/configuration, update the Compose
   service, verify container health and exercise the page/trainer through its real
   ingress. Serialize releases to avoid overlapping updates.
6. Record deployed digest, source commit, approver and smoke-test results. On failed
   health/smoke checks restore the previous digest/configuration and verify again.
   Retain rollback images; define registry retention before pruning.

Compose replacement can briefly interrupt service; zero-downtime delivery is not
promised. Rehearse rollback and Windows reboot recovery before calling the host
production-ready. Confirm Docker/backend availability without interactive login,
service/restart policy, firewall/port bindings and storage/backup needs. Container
restart policies alone do not prove the engine starts after a Windows reboot.

## Access and implementation decisions

Confirm Docker backend and CPU architecture, current Compose/reverse-proxy setup,
network reachability (including NAT/CGNAT), TLS/DNS handling, monitoring and owner
operations preferences. Hosting on a private machine is separate from public
access: public oversweep.com and private previews need explicit routing/access
decisions. Do not change DNS, open ports or enable tunnels during planning.

Next deliverable: a reviewed server inventory and delivery decision recorded in
the issue or PR, selecting manual
promotion or deploy-only runner, a credential/approval plan, Compose/release
contract, smoke tests, rollback and reboot test plan. Only then author deployment
workflows/configuration in a separately authorised task.

## Primary documentation

Assessed 22 October 2026; verify account entitlements and installed versions before implementation.

- [GitHub image publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [GHCR authentication and visibility](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Self-hosted runner requirements](https://docs.github.com/en/actions/reference/runners/self-hosted-runners)
- [Runner security](https://docs.github.com/en/actions/reference/security/secure-use)
- [Environment and approval availability](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/features/wsl/)
