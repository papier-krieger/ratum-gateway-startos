import { i18n } from './i18n'
import { sdk } from './sdk'
import { stratumPort } from './utils'

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
      .mountAssets({
        subpath: 'startos-root.crt',
        mountpoint: '/usr/local/share/ca-certificates/startos-root.crt',
        type: 'file',
      }),
    'ratum-subcontainer',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('trust-root-ca', {
      subcontainer: gatewaySub,
      exec: { command: ['update-ca-certificates'], user: 'root' },
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
