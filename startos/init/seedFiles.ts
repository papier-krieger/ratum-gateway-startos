import { gatewayJson } from '../fileModels/gateway.json'
import { poolProfile } from '../fileModels/poolProfile.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async effects => {
  await gatewayJson.merge(effects, {})
  await poolProfile.merge(effects, {})
})
