import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_1_0_1 = VersionInfo.of({
  version: '1.1.0:1',
  releaseNotes: {
    en_US: 'Trusts every Root CA found in the package assets, so one build works with any StartOS server',
    es_ES: 'Confía en todas las CA raíz de los assets del paquete, así un solo paquete sirve para cualquier servidor StartOS',
    de_DE: 'Vertraut allen Root-CAs im Paket, sodass ein Build mit jedem StartOS-Server funktioniert',
    pl_PL: 'Ufa wszystkim głównym urzędom certyfikacji z zasobów pakietu, więc jedna wersja działa z każdym serwerem StartOS',
    fr_FR: 'Fait confiance à toutes les CA racine du dossier assets : un seul paquet pour tous les serveurs StartOS',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
