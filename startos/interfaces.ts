import { i18n } from './i18n'
import { sdk } from './sdk'
import { dashboardPort, stratumPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'stratum')
  const origin = await multi.bindPort(stratumPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: stratumPort,
    secure: { ssl: false },
  })

  const stratum = sdk.createInterface(effects, {
    name: i18n('Stratum Server'),
    id: 'stratum',
    description: i18n('Point your ASICs here'),
    type: 'p2p',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const uiMulti = sdk.MultiHost.of(effects, 'dashboard')
  const uiOrigin = await uiMulti.bindPort(dashboardPort, { protocol: 'http' })

  const dashboard = sdk.createInterface(effects, {
    name: i18n('Dashboard'),
    id: 'dashboard',
    description: i18n('Live status of your gateway and miners'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [
    await origin.export([stratum]),
    await uiOrigin.export([dashboard]),
  ]
})
