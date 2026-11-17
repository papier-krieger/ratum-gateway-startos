import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'ratum-gateway',
  title: 'Ratum Gateway',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/papier-krieger/ratum-gateway-startos',
  upstreamRepo: 'https://github.com/iohzrd/ratum',
  marketingUrl: 'https://github.com/iohzrd/ratum',
  donationUrl: null,
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
