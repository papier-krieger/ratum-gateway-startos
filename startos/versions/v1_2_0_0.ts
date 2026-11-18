import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_2_0_0 = VersionInfo.of({
  version: '1.2.0:0',
  releaseNotes: {
    en_US: 'New optional field in Configure Gateway: paste a Root CA certificate so the gateway trusts another StartOS server without rebuilding the package',
    es_ES: 'Nuevo campo opcional en Configure Gateway: pegue un certificado de CA raíz para que el gateway confíe en otro servidor StartOS sin reconstruir el paquete',
    de_DE: 'Neues optionales Feld in Configure Gateway: Root-CA-Zertifikat einfügen, damit das Gateway einem weiteren StartOS-Server vertraut, ohne das Paket neu zu bauen',
    pl_PL: 'Nowe opcjonalne pole w Configure Gateway: wklej certyfikat głównego urzędu certyfikacji, aby gateway ufał kolejnemu serwerowi StartOS bez przebudowy pakietu',
    fr_FR: 'Nouveau champ facultatif dans Configure Gateway : collez un certificat de CA racine pour que le gateway fasse confiance à un autre serveur StartOS sans reconstruire le paquet',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
