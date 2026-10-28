import data from './fund.json';

export type FundOption = {
  id: string; title: string; short: string; time: string; cost: string; best: string; desc: string;
  steps: string[]; notes: string[];
};
export type Lang = 'es' | 'en';

export const FUND_SLUGS: Record<string, string> = {
  cash: 'efectivo', ach: 'ach', wire: 'wire', remesas: 'remesas', check: 'cheque-movil',
  paypal: 'paypal', wise: 'wise', pagotronic: 'pagotronic', internal: 'entre-cuentas',
};

export const LOGIN_URL = 'https://secureib.facebank.pr/personas/banca-virtual#!/login';

export const getFund = (lang: Lang) => data[lang] as typeof data.es & { options: FundOption[] };

export const base = (lang: Lang) => (lang === 'en' ? '/en/fondear-cuenta/' : '/fondear-cuenta/');

/** Contenido interno de los iconos SVG (viewBox 24). */
export const FUND_ICONS: Record<string, string> = {
  cash: '<rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ach: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  wire: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9S14.6 18.4 12 21c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  remesas: '<path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<rect x="7" y="3" width="10" height="18" rx="2.2" stroke="currentColor" stroke-width="1.6"/><path d="m10 12 1.6 1.6L14.5 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  paypal: '<rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M16 14.5h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.6"/>',
  wise: '<path d="M20 12a8 8 0 0 0-14-5.3M4 12a8 8 0 0 0 14 5.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 3v4h4M18 21v-4h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v6M10.2 10.6c0-.9.8-1.4 1.8-1.4s1.8.5 1.8 1.4c0 1.8-3.6.8-3.6 2.8 0 .9.8 1.4 1.8 1.4s1.8-.5 1.8-1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  pagotronic: '<rect x="5" y="3" width="14" height="18" rx="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 7h7M8.5 11h2M12 11h2M15.5 11h.01M8.5 14.5h2M12 14.5h2M15.5 14.5h.01M8.5 18h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  internal: '<circle cx="8" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 19c.5-3 2.6-4.6 5.5-4.6s5 1.6 5.5 4.6M15 14.6c2.8-.3 5 1 5.5 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
};

export const ARROW = '<path d="M4 14 14 4M14 4H6M14 4v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
