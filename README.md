<p align="center">
  <img src="icon.svg" alt="Ratum Gateway Logo" width="21%">
</p>

# Ratum Gateway on StartOS

> Everything not listed in this document should behave the same as upstream
> Ratum Gateway. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Ratum Gateway](https://github.com/iohzrd/ratum) sits between your mining hardware and your Bitcoin node. It hands out work to your miners over the stratum protocol and either forwards it to a DATUM pool or, with no pool configured, mines directly so that every block you find pays your own address.

This package adds one thing to upstream: a **Solo Mining** switch in the Configure Gateway action. It flips the whole gateway between pool mining and solo mining while keeping your pool details, so you can switch back without typing them again.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is built from source by this package's `Dockerfile`, not pulled from a registry. A first build stage fetches upstream at one pinned commit and compiles only the gateway binary; the final image is a slim Debian with the CA-certificates tooling and that one binary. The package supports x86_64 only.

The Dockerfile makes one change to upstream's `Cargo.toml` before compiling: it switches the HTTP client's TLS feature to the variant that reads the system certificate store. The build fails on purpose if that line no longer matches, so a silent loss of the change is not possible. Without it the gateway cannot trust the certificate your StartOS Bitcoin node serves over HTTPS.

The package runs one subcontainer, `ratum-subcontainer`, with two processes started in order:

| Process           | Kind    | What it does                                                                                           |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `trust-root-ca`   | oneshot | Runs `update-ca-certificates` as root, so every Root CA in the package's `assets/` folder is trusted. |
| `ratum-daemon`    | daemon  | Runs `ratum-gateway -c /data/gateway.json`. Starts only after `trust-root-ca` has finished.            |

No environment variables are set by the package.

## Volume and Data Layout

The package has one volume, `ratum-volume`, mounted at `/data` in the subcontainer. It holds exactly two files, `gateway.json` (the gateway's configuration) and `pool-profile.json` (your saved pool details, see [File Models](#file-models)).

The package's `assets/` folder is mounted read-only at `/usr/local/share/ca-certificates`. It is part of the package, not of the volume, and holds the Root CA certificates of the StartOS servers that host a Bitcoin node (one `.crt` file per server).

## File Models

The package owns two JSON files in `ratum-volume`. Both are seeded with defaults on the first initialization, so a fresh install already has complete files.

**`gateway.json`** is the gateway's own configuration file, read by the daemon **once at startup**. Nothing re-reads it while the service runs, so a change takes effect only after a restart.

- Written by the Configure Gateway action, which sets only these keys: `bitcoind.rpcurl`, `bitcoind.rpcuser`, `bitcoind.rpcpassword`, `mining.pool_address`, `datum.pool_host`, `datum.pool_port`, `datum.pool_pubkey`, `datum.pooled_mining_only`, `datum.protocol_v3` and `api.admin_password`.
- Every other key (client limits, `vardiff_min`, the coinbase tags, log level and so on) is seeded once with a default and then belongs to the user. A hand edit survives, because the action only merges the keys listed above.
- The two listening ports (`stratum.listen_port` and `api.listen_port`) are fixed by the package to match the interfaces. Do not change them in the file.
- An **empty `datum.pool_host`** is what puts the gateway in non-pooled (solo) mode. The Solo Mining switch writes that value; it is not a separate setting.

**`pool-profile.json`** remembers the DATUM pool details (`pool_host`, `pool_port`, `pool_pubkey`, `pooled_mining_only`). Configure Gateway writes it whenever the pool details are complete, and reads it only to prefill the form while Solo Mining is on, because `gateway.json` has no pool host in that mode. The gateway itself never reads this file. A hand edit survives, and it only affects what the form shows.

## Dependencies

None. The package does not depend on another StartOS service. The Bitcoin node is reached over RPC by URL, username and password that you enter in Configure Gateway, so it can run on the same server, on another StartOS server or anywhere else the gateway can reach. If the node is served over HTTPS with a StartOS-issued certificate, its server's Root CA must be among the files in the package's `assets/` folder (see [Limitations and Differences](#limitations-and-differences)).

## Network Access and Interfaces

The package exposes two interfaces.

| Interface id | Type | Port  | Protocol            | Purpose                                                          |
| ------------ | ---- | ----- | ------------------- | ---------------------------------------------------------------- |
| `stratum`    | p2p  | 23334 | stratum over TCP, no TLS | Where miners connect. Point your ASICs at this interface.   |
| `dashboard`  | ui   | 8081  | HTTP                | Live status of the gateway and of the connected miners.          |

The dashboard's `/stats.json` includes the payout rows of the current job without a login, even when a dashboard password is set (the password only unlocks the miner list). Do not publish the dashboard interface to the internet or forward its port; keep it on your private network or Tor.

## Installation and First-Run Flow

A fresh install starts the daemon with seeded defaults, which have no Bitcoin node and no payout address. The gateway has no work to give out until you run **Configure Gateway** once and restart the service afterwards.

The order that matters: create RPC credentials on your Bitcoin node first, run Configure Gateway second, restart the service third, point the miners at the Stratum Server address last. The package creates no setup task and does not start a wizard.

## Actions

The package has one user-facing action, **Configure Gateway**. It carries the Solo Mining switch.

- **When to run it:** at first setup, and whenever the node credentials, the payout address, the dashboard password, the DATUM protocol setting or the mode (solo or pool) changes.
- **What it changes:** the keys of `gateway.json` listed under [File Models](#file-models), and `pool-profile.json` whenever the Pool Host, Pool Port and Pool Public Key are all filled in.
- **Solo Mining on:** writes an empty pool host and turns off "Pooled Mining Only", so the gateway mines without a pool and every block pays the Payout Address as a single output. The pool fields may be left empty.
- **Solo Mining off:** pool mode. The action refuses to save unless Pool Host, Pool Port and Pool Public Key are all filled in (or were saved before), and it prefills them from the saved profile.
- **Cost:** instant. It does **not** restart the service, so the change is not active until you restart it.
- **Repeat safety:** safe to repeat; saving the same values again changes nothing.
- **What happens next:** restart the service. All connected miners then reconnect, and miners with backup pool lines may mine there for a few minutes while the gateway is down.

## Tasks

None. The package never raises a task, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check exists, the daemon's readiness check, shown as **Stratum Server**. It probes whether the stratum port is accepting connections.

A failure right after a start usually means the gateway is still starting. If it stays failed, the gateway has exited, most often because the Bitcoin node is unreachable or refuses the RPC credentials, or because the node's HTTPS certificate is not trusted (look for an "UnknownIssuer" certificate error in the service logs). If `trust-root-ca` fails, the daemon does not start at all, since it requires that step.

## Backups and Restore

The backup strategy is a plain copy of the whole `ratum-volume` volume. Both files are included, so a backup contains the node's RPC password and the dashboard password as plain values inside `gateway.json`; treat backups as sensitive.

The `assets/` folder is not in the backup, because it ships inside the package. After a restore, the gateway needs nothing rebuilt, but if you restore onto a server whose Bitcoin node uses a Root CA that is not in the package's `assets/` folder, the gateway will not trust that node until the package is rebuilt with that CA added. Restart the service after the restore, since the configuration is read at startup.

## Limitations and Differences

1. **x86_64 only.** There is no build for other architectures.
2. **One source change to upstream:** the TLS feature switch described under [Image and Container Runtime](#image-and-container-runtime). Everything else is upstream's code at one pinned commit.
3. **Trusted Root CAs are fixed at build time.** Only the `.crt` files in the package's `assets/` folder at build time are trusted. A Bitcoin node behind an HTTPS address whose Root CA is not there fails with a certificate error until the package is rebuilt with that file added. The files are deliberately not tracked in git.
4. **Changes need a restart.** The gateway reads its configuration only at startup.
5. **Solo mode has no pool.** Rewards arrive only when your own hardware finds a block, and then in full to the Payout Address. There are no share-based payouts.
6. **Stratum is unencrypted.** The stratum interface serves plain TCP without TLS.
7. **Dashboard exposure.** See [Network Access and Interfaces](#network-access-and-interfaces); the dashboard must stay private.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'ratum-gateway'
image: built from Dockerfile (upstream source at a pinned commit)
architectures: [x86_64]
subcontainers: [ratum-subcontainer]
volumes:
  ratum-volume: /data
file_models:
  - ratum-volume/gateway.json
  - ratum-volume/pool-profile.json
startos_managed_env_vars: []
dependencies: none
interfaces:
  stratum: { type: p2p, port: 23334 }
  dashboard: { type: ui, port: 8081 }
actions:
  - configure-gateway
tasks: []
health_checks:
  - ratum-daemon
```
