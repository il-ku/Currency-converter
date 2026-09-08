export type CurrencyCode =
  | 'RUB'
  | 'USD'
  | 'UZS'
  | 'KRW'
  | 'CNY'
  | 'JPY'
  | 'BRL'
  | 'EUR'
  | 'GBP'
  | 'KZT'
  | 'TRY'
  | 'AED'
  | 'GEL'
  | 'BYN'
  | 'THB'
  | string;

export type BankSourceId = 'sberbank' | 'kapitalbank' | 'ligovka' | 'cbr';

export interface BankSource {
  id: BankSourceId;
  name: string;
  shortName: string;
  country: string;
  countryFlag: string;
  url: string;
  description: string;
  tag: string;
  badgeColor: string;
}

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  nameRu: string;
  symbol: string;
  flag: string;
  decimals: number;
  isDefault: boolean;
}

export interface RateQuote {
  currency: CurrencyCode;
  baseCurrency: CurrencyCode; // usually RUB or UZS
  buy: number;  // Банк покупает у клиента
  sell: number; // Банк продает клиенту
  centralBank?: number; // Официальный курс (ЦБ)
  change24h: number; // процент изменения
  updatedAt: string;
}

export interface BankRatesCollection {
  sourceId: BankSourceId;
  rates: Record<CurrencyCode, RateQuote>;
  timestamp: number;
}

export interface HistoryPoint {
  date: string; // YYYY-MM-DD
  rate: number;
  buyRate: number;
  sellRate: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = '7d' | '30d' | '90d' | '1y';

export interface CurrencyPair {
  from: CurrencyCode;
  to: CurrencyCode;
}
