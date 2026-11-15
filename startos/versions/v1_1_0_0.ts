import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_1_0_0 = VersionInfo.of({
  version: '1.1.0:0',
  releaseNotes: {
    en_US: 'Adds a Solo Mining toggle (no pool); your pool details are kept when you switch',
    es_ES: 'Añade un interruptor de Solo Mining (sin pool); los datos del pool se conservan al cambiar',
    de_DE: 'Fügt einen Solo-Mining-Schalter hinzu (ohne Pool); die Pool-Daten bleiben beim Wechseln erhalten',
    pl_PL: 'Dodaje przełącznik Solo Mining (bez puli); dane puli są zachowywane przy przełączaniu',
    fr_FR: 'Ajoute un interrupteur Solo Mining (sans pool) ; les détails du pool sont conservés lors du changement',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
