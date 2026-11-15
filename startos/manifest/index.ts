import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'ratum-gateway',
  title: 'Ratum Gateway',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/REPLACE_ME/ratum-gateway-startos',
  upstreamRepo: 'https://github.com/iohzrd/ratum',
  marketingUrl: 'https://REPLACE_ME',
  donationUrl: 'https://REPLACE_ME',
  description: { short, long },
  volumes: ['ratum-volume'],
  images: {
    'ratum-gateway': {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
      arch: ['x86_64'],
    },
  },
  dependencies: {},
})
