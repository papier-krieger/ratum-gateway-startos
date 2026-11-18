import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Optional extra Root CA (PEM text, one certificate) pasted in Configure Gateway.
// main.ts copies it next to the assets' certificates before update-ca-certificates runs.
export const extraCa = FileHelper.string({
  base: sdk.volumes['ratum-volume'],
  subpath: 'extra-root-ca.crt',
})
