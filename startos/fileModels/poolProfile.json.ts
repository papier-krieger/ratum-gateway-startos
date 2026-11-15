import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Pool settings remembered while Solo Mining is on, so switching back loses nothing.
const shape = z.object({
  pool_host: z.string().catch(''),
  pool_port: z.number().catch(0),
  pool_pubkey: z.string().catch(''),
  pooled_mining_only: z.boolean().catch(true),
})

export const poolProfile = FileHelper.json(
  { base: sdk.volumes['ratum-volume'], subpath: 'pool-profile.json' },
  shape,
)
