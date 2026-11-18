import { i18n } from './i18n'
import { sdk } from './sdk'
import { stratumPort } from './utils'

// Runs as root before the daemon: gathers every Root CA into the system store.
//  - /opt/assets-ca: the package's assets (one .crt per StartOS server, read-only)
//  - /data/extra-root-ca.crt: optional certificate pasted in Configure Gateway
const trustScript = [
  'mkdir -p /usr/local/share/ca-certificates',
  'rm -f /usr/local/share/ca-certificates/extra-root-ca.crt',
  'for f in /opt/assets-ca/*.crt; do [ -f "$f" ] && cp "$f" /usr/local/share/ca-certificates/; done',
  '[ -s /data/extra-root-ca.crt ] && cp /data/extra-root-ca.crt /usr/local/share/ca-certificates/extra-root-ca.crt',
  'update-ca-certificates --fresh',
].join('; ')

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Ratum Gateway!'))

  const gatewaySub = sdk.SubContainer.of(
    effects,
    { imageId: 'ratum-gateway' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'ratum-volume',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      // One Root CA per StartOS server that hosts the Bitcoin node (copied by trust-root-ca).
      .mountAssets({
        subpath: null,
        mountpoint: '/opt/assets-ca',
        type: 'directory',
      }),
    'ratum-subcontainer',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('trust-root-ca', {
      subcontainer: gatewaySub,
      exec: { command: ['sh', '-c', trustScript], user: 'root' },
      requires: [],
    })
    .addDaemon('ratum-daemon', {
      subcontainer: gatewaySub,
      exec: { command: ['ratum-gateway', '-c', '/data/gateway.json'] },
      ready: {
        display: i18n('Stratum Server'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, stratumPort, {
            successMessage: i18n('The stratum server is ready'),
            errorMessage: i18n('The stratum server is not ready'),
          }),
      },
      requires: ['trust-root-ca'],
    })
})
