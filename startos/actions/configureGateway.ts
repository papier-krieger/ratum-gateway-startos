import { sdk } from '../sdk'
import { gatewayJson } from '../fileModels/gateway.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  rpcUrl: Value.text({
    name: i18n('Bitcoin RPC URL'),
    description: i18n('The RPC address of your Bitcoin node, e.g. https://<host>:<port>'),
    required: true,
    masked: false,
    default: null,
  }),
  rpcUser: Value.text({
    name: i18n('Bitcoin RPC Username'),
    description: i18n('The RPC username created on your Bitcoin node'),
    required: true,
    masked: false,
    default: null,
  }),
  rpcPassword: Value.text({
    name: i18n('Bitcoin RPC Password'),
    description: i18n('The RPC password created on your Bitcoin node'),
    required: true,
    masked: true,
    default: null,
  }),
  payoutAddress: Value.text({
    name: i18n('Payout Address'),
    description: i18n('The Bitcoin address that receives mining rewards'),
    required: true,
    masked: false,
    default: null,
  }),
  poolHost: Value.text({
    name: i18n('Pool Host'),
    description: i18n('The DATUM pool hostname, e.g. pool.example.com'),
    required: true,
    masked: false,
    default: null,
  }),
  poolPort: Value.number({
    name: i18n('Pool Port'),
    description: i18n('The DATUM pool port'),
    required: true,
    default: 28916,
    min: 1,
    max: 65535,
    step: 1,
    integer: true,
    units: null,
  }),
  poolPubkey: Value.text({
    name: i18n('Pool Public Key'),
    description: i18n('The DATUM pool public key, published on the pool website'),
    required: true,
    masked: false,
    default: null,
  }),
  dashboardPassword: Value.text({
    name: i18n('Dashboard Password'),
    description: i18n(
      'Password to see connected miners on the dashboard. Leave empty to show only the summary',
    ),
    required: false,
    masked: true,
    default: null,
  }),
  pooledMiningOnly: Value.toggle({
    name: i18n('Pooled Mining Only'),
    description: i18n(
      'Refuse miners while the pool is unreachable, so they fail over to their backup pool. Turn off to keep serving work without a pool',
    ),
    default: true,
  }),
  protocolV3: Value.toggle({
    name: i18n('DATUM Protocol v3'),
    description: i18n(
      'Use protocol v3 (required by pools like Paperclip). Turn off for pools that only support v1',
    ),
    default: true,
  }),
})

export const configureGateway = sdk.Action.withInput(
  'configure-gateway',
  async () => ({
    name: i18n('Configure Gateway'),
    description: i18n('Set your Bitcoin RPC credentials, payout address, and DATUM pool'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const g = await gatewayJson.read().once()
    return {
      rpcUrl: g?.bitcoind.rpcurl,
      rpcUser: g?.bitcoind.rpcuser,
      rpcPassword: g?.bitcoind.rpcpassword,
      payoutAddress: g?.mining.pool_address,
      poolHost: g?.datum.pool_host,
      poolPort: g?.datum.pool_port,
      poolPubkey: g?.datum.pool_pubkey,
      dashboardPassword: g?.api.admin_password,
      pooledMiningOnly: g?.datum.pooled_mining_only,
      protocolV3: g?.datum.protocol_v3,
    }
  },
  async ({ effects, input }) => {
    await gatewayJson.merge(effects, {
      bitcoind: {
        rpcurl: input.rpcUrl,
        rpcuser: input.rpcUser,
        rpcpassword: input.rpcPassword,
      },
      mining: {
        pool_address: input.payoutAddress,
      },
      datum: {
        pool_host: input.poolHost,
        pool_port: input.poolPort,
        pool_pubkey: input.poolPubkey,
        pooled_mining_only: input.pooledMiningOnly,
        protocol_v3: input.protocolV3,
      },
      api: {
        admin_password: input.dashboardPassword ?? '',
      },
    })
  },
)
