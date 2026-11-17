# Updating the upstream version

"Upstream" here is the Rust project [iohzrd/ratum](https://github.com/iohzrd/ratum). The package does not pull a published image. It compiles the gateway from source inside the `Dockerfile`, at **one pinned git commit**, so a build is reproducible and an upstream change never reaches the package by itself.

The package also depends on two upstream behaviors that must be re-checked after every bump:

- **Solo mode** relies on the gateway treating an empty `datum.pool_host` as non-pooled mode, where every block pays `mining.pool_address` as a single output. The Solo Mining switch writes exactly that value.
- **The TLS change.** The Dockerfile replaces `features = ["https"]` with `features = ["https-rustls-probe"]` in upstream's `Cargo.toml`, so the gateway trusts the system certificate store. The build fails on purpose (a `grep -q` guard) if that line no longer matches.

## Determining the upstream version

The pin is the `RATUM_REV` build argument in `Dockerfile` (a full commit hash). The upstream version number is the workspace package `version` in upstream's top-level `Cargo.toml` at that commit.

To see what upstream is at now:

```bash
git ls-remote https://github.com/iohzrd/ratum HEAD
```

To compare the pinned commit with a newer one, clone upstream and run `git log <pinned>..<new> --oneline`, and read the changes that touch the gateway, the configuration keys (`datum.*`, `mining.*`, `api.*`, `stratum.*`, `bitcoind.*`) and the HTTP client dependency.

## Applying the bump

1. Edit `ARG RATUM_REV=` in `Dockerfile` to the new commit hash.
2. Check that the TLS `sed` line still matches in the new `Cargo.toml`: build once, and read the `grep minreq` output near the start of the build.
3. Add a new file in `startos/versions/` for the package version (copy the latest one), update `startos/versions/index.ts` (`current` and `other`), and write release notes in all five locales. Versions look like `1.1.0:1` (package version, a colon, then the package revision); follow the existing files.
4. Put each Bitcoin node server's Root CA into `assets/` as a `.crt` file before building. These files are **not tracked in git** (they are in `.gitignore`), so a fresh checkout has none.
5. Build with `make` (x86 only).
6. Test on a spare StartOS server before touching production:
   - Run **Configure Gateway** and confirm that the form still loads and saves.
   - In solo mode, read `/stats.json` from the dashboard port and confirm that exactly one payout row exists, carrying the full block value and your payout address, and that the gateway reports non-pooled mode.
   - Connect one miner and confirm accepted shares.
7. Keep the previous `.s9pk` file as a rollback.
