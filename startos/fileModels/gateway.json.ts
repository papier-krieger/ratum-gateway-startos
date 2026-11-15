import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { dashboardPort, stratumPort } from '../utils'

const bitcoindShape = z.object({
  rpcurl: z.string().catch(''),
  rpcuser: z.string().catch(''),
  rpcpassword: z.string().catch(''),
  notify_fallback: z.boolean().catch(true),
})

const miningShape = z.object({
  pool_address: z.string().catch(''),
  coinbase_tag_primary: z.string().catch('ratum-gateway-startos'),
  coinbase_tag_secondary: z.string().catch(''),
})

const stratumShape = z.object({
  listen_port: z.literal(stratumPort).catch(stratumPort),
  vardiff_min: z.number().catch(16384),
  max_threads: z.number().catch(8),
  max_clients: z.number().catch(64),
  max_clients_per_thread: z.number().catch(64),
})

const datumShape = z.object({
  pool_host: z.string().catch(''),
  pool_port: z.number().catch(0),
  pool_pubkey: z.string().catch(''),
  pool_pass_workers: z.boolean().catch(true),
  pool_pass_full_users: z.boolean().catch(true),
  pooled_mining_only: z.boolean().catch(false),
  protocol_v3: z.boolean().catch(true),
})

const loggerShape = z.object({
  log_level_console: z.number().catch(2),
})


const apiShape = z.object({
  listen_port: z.literal(dashboardPort).catch(dashboardPort),
  admin_password: z.string().catch(''),
})

const shape = z.object({
  bitcoind: bitcoindShape.catch(() => bitcoindShape.parse({})),
  mining: miningShape.catch(() => miningShape.parse({})),
  stratum: stratumShape.catch(() => stratumShape.parse({})),
  datum: datumShape.catch(() => datumShape.parse({})),
  logger: loggerShape.catch(() => loggerShape.parse({})),
  api: apiShape.catch(() => apiShape.parse({})),
})

export const gatewayJson = FileHelper.json(
  { base: sdk.volumes['ratum-volume'], subpath: 'gateway.json' },
  shape,
)
