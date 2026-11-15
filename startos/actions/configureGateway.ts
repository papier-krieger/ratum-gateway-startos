import { sdk } from '../sdk'
import { gatewayJson } from '../fileModels/gateway.json'
import { poolProfile } from '../fileModels/poolProfile.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  soloMining: Value.toggle({
    name: i18n('Solo Mining'),
    description: i18n(
      'On: mine without a pool, and found blocks pay the Payout Address. Off: mine to the DATUM pool below. Your pool details are kept when you switch',
    ),
    default: false,
  }),
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
    required: false,
    masked: false,
    default: null,
  }),
  poolPort: Value.number({
    name: i18n('Pool Port'),
    description: i18n('The DATUM pool port'),
    required: false,
    default: null,
    min: 1,
    max: 65535,
    step: 1,
    integer: true,
    units: null,
  }),
  poolPubkey: Value.text({
    name: i18n('Pool Public Key'),
    description: i18n('The DATUM pool public key, published on the pool website'),
    required: false,
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
    const p = await poolProfile.read().once()
    // Solo = an address is set but the pool host is empty (a fresh install starts in pool mode).
    const solo = !!g && g.datum.pool_host === '' && g.mining.pool_address !== ''
    return {
      soloMining: solo,
      rpcUrl: g?.bitcoind.rpcurl,
      rpcUser: g?.bitcoind.rpcuser,
      rpcPassword: g?.bitcoind.rpcpassword,
      payoutAddress: g?.mining.pool_address,
      // While solo, the pool details come from the saved profile.
      poolHost: g?.datum.pool_host || p?.pool_host || undefined,
      poolPort: g?.datum.pool_port || p?.pool_port || undefined,
      poolPubkey: g?.datum.pool_pubkey || p?.pool_pubkey || undefined,
      dashboardPassword: g?.api.admin_password,
      pooledMiningOnly: solo ? p?.pooled_mining_only : g?.datum.pooled_mining_only,
      protocolV3: g?.datum.protocol_v3,
    }
  },
  async ({ effects, input }) => {
    const solo = input.soloMining
    const host = (input.poolHost ?? '').trim()
    const port = input.poolPort ?? 0
    const pubkey = (input.poolPubkey ?? '').trim()
    const haveProfile = host !== '' && port > 0 && pubkey !== ''

    if (!solo && !haveProfile) {
      throw new Error(
        'Pool mode needs the Pool Host, Pool Port and Pool Public Key. Fill them in, or turn on Solo Mining.',
      )
    }

    // Remember the pool details whenever they are complete, so Solo never loses them.
    if (haveProfile) {
      await poolProfile.merge(effects, {
        pool_host: host,
        pool_port: port,
        pool_pubkey: pubkey,
        pooled_mining_only: input.pooledMiningOnly,
      })
    }

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
        // An empty host is what puts the gateway in non-pooled (solo) mode.
        pool_host: solo ? '' : host,
        pool_port: port,
        pool_pubkey: pubkey,
        pooled_mining_only: solo ? false : input.pooledMiningOnly,
        protocol_v3: input.protocolV3,
      },
      api: {
        admin_password: input.dashboardPassword ?? '',
      },
    })
  },
)
