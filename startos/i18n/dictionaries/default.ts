export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Ratum Gateway!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'Stratum Server': 4,
  'The stratum server is ready': 5,
  'The stratum server is not ready': 6,
  // interfaces.ts
  'Point your ASICs here': 7,
  // actions/configureGateway.ts
  'Bitcoin RPC URL': 8,
  'The RPC address of your Bitcoin node, e.g. https://<host>:<port>': 9,
  'Bitcoin RPC Username': 10,
  'The RPC username created on your Bitcoin node': 11,
  'Bitcoin RPC Password': 12,
  'The RPC password created on your Bitcoin node': 13,
  'Payout Address': 14,
  'The Bitcoin address that receives mining rewards': 15,
  'Pool Host': 16,
  'The DATUM pool hostname, e.g. pool.example.com': 17,
  'Pool Port': 18,
  'The DATUM pool port': 19,
  'Pool Public Key': 20,
  'The DATUM pool public key, published on the pool website': 21,
  'Configure Gateway': 22,
  'Set your Bitcoin RPC credentials, payout address, and DATUM pool': 23,
  // dashboard (interfaces.ts and actions/configureGateway.ts)
  Dashboard: 24,
  'Live status of your gateway and miners': 25,
  'Dashboard Password': 26,
  'Password to see connected miners on the dashboard. Leave empty to show only the summary': 27,
  // pool behavior (actions/configureGateway.ts)
  'Pooled Mining Only': 28,
  'Refuse miners while the pool is unreachable, so they fail over to their backup pool. Turn off to keep serving work without a pool': 29,
  'DATUM Protocol v3': 30,
  'Use protocol v3 (required by pools like Paperclip). Turn off for pools that only support v1': 31,
  // solo mode (actions/configureGateway.ts)
  'Solo Mining': 32,
  'On: mine without a pool, and found blocks pay the Payout Address. Off: mine to the DATUM pool below. Your pool details are kept when you switch': 33,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
