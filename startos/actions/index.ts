import { sdk } from '../sdk'
import { configureGateway } from './configureGateway'

export const actions = sdk.Actions.of().addAction(configureGateway)
