# Ratum Gateway

## Documentation

- [Ratum Gateway on GitHub](https://github.com/iohzrd/ratum) — the upstream project and its documentation

## What you get on StartOS

Ratum Gateway gives your miners two things to connect to. The **Stratum Server** interface is where your ASICs connect. The **Dashboard** interface shows the live status of the gateway and, once you set a dashboard password, of every connected miner.

One action, **Configure Gateway**, holds everything you set: your Bitcoin node's RPC credentials, your payout address, and a **Solo Mining** switch. With the switch off, the gateway mines to your DATUM pool. With it on, it mines without a pool, and every block you find pays your payout address. Your pool details are kept while you mine solo, so switching back is one click.

## Getting set up

1. On your Bitcoin node, create RPC credentials (a username and a password). On StartOS, the node's own actions can generate them. Note the node's RPC address as well, in the form `https://<host>:<port>`.
2. Open Ratum Gateway, go to **Actions**, and run **Configure Gateway**.
3. Fill in the Bitcoin RPC URL, username and password, and the Payout Address.
4. Choose your mode:
   - **Solo Mining on:** nothing more is needed. Leave the pool fields empty.
   - **Solo Mining off:** fill in the Pool Host, Pool Port and Pool Public Key. You find these on your DATUM pool's website.
5. Optionally set a **Dashboard Password**. Without it the dashboard shows only a summary; with it you can also see the connected miners.
6. Only if the logs show a certificate error for your node: paste its server's Root CA certificate (PEM text, one certificate) into **Extra Root CA**.
7. Save, then **restart** Ratum Gateway. The gateway reads these settings only when it starts.
8. Wait until the **Stratum Server** health check is green, then point each miner at the Stratum Server address shown on the **Interfaces** page.

## Using Ratum Gateway

### Switching between solo and pool

Run **Configure Gateway**, change the **Solo Mining** switch, save, and restart the service. Every miner connected to this gateway switches together; your pool details stay saved. Pool mode needs the Pool Host, Pool Port and Pool Public Key, and the action tells you if one is missing.

If you run more than one gateway, you can also move individual miners between them by changing where each miner connects.

### Dashboard

The dashboard shows the current block height, the job being mined and, with a dashboard password set, each connected miner with its hashrate and accepted and rejected shares. Keep it on your private network or Tor and do not publish it to the internet, since it also shows the payout details of the current job.

### Pool mode and backup pools

With **Pooled Mining Only** on, the gateway refuses miners while the pool is unreachable, so they move on to their own backup pool lines. Turn it off to keep serving work without a pool.

## Limitations

- In solo mode there are no pool payouts. You are paid only when your own miners find a block, and then the whole reward goes to your payout address.
- Settings take effect only after a restart of the service.
- The gateway trusts the Root CA certificates that were included when the package was built, plus the one you paste into **Extra Root CA**. If your Bitcoin node's address is not accepted because of a certificate error in the logs, paste that server's Root CA there and restart.
