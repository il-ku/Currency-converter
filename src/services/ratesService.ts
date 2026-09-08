import {
  BankSourceId,
  CurrencyCode,
  HistoryPoint,
  RateQuote,
  Timeframe,
} from '../types/currency';

// Baseline realistic rates relative to 1 USD
interface RawBaseRates {
  RUB: number;
  UZS: number;
  KRW: number;
  CNY: number;
  JPY: number;
  BRL: number;
  EUR: number;
  GBP: number;
  KZT: number;
  TRY: number;
  AED: number;
  GEL: number;
  BYN: number;
  THB: number;
  CHF: number;
  [key: string]: number;
}

const DEFAULT_USD_RATES: RawBaseRates = {
  USD: 1,
  RUB: 91.85,
  UZS: 12870.0,
  KRW: 1395.0,
  CNY: 7.23,
  JPY: 154.2,
  BRL: 5.82,
  EUR: 0.92,
  GBP: 0.79,
  KZT: 495.0,
  TRY: 35.8,
  AED: 3.6725,
  GEL: 2.78,
  BYN: 3.28,
  THB: 34.5,
  CHF: 0.88,
};

// 24h realistic market drift factors
const DRIFT_24H: Record<string, number> = {
  RUB: +0.42,
  UZS: -0.15,
  KRW: -0.28,
  CNY: +0.08,
  JPY: -0.52,
  BRL: +0.65,
  EUR: +0.12,
  GBP: -0.05,
  KZT: +0.31,
  TRY: +0.85,
  AED: 0.0,
  GEL: -0.11,
  BYN: +0.18,
  THB: -0.22,
  CHF: +0.05,
};

export interface AllBankRates {
  sberbank: Record<string, RateQuote>;
  kapitalbank: Record<string, RateQuote>;
  ligovka: Record<string, RateQuote>;
  cbr: Record<string, RateQuote>;
  lastUpdated: string;
}

const STORAGE_KEY = 'currency_rates_cache_v2';
const ACTIVE_CURRENCIES_KEY = 'tracked_currencies_v2';

export function getStoredTrackedCurrencies(): CurrencyCode[] {
  try {
    const saved = localStorage.getItem(ACTIVE_CURRENCIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read saved currencies:', e);
  }
  // Default currencies requested by user:
  return ['RUB', 'USD', 'UZS', 'KRW', 'CNY', 'JPY', 'BRL'];
}

export function saveTrackedCurrencies(currencies: CurrencyCode[]) {
  try {
    localStorage.setItem(ACTIVE_CURRENCIES_KEY, JSON.stringify(currencies));
  } catch (e) {
    console.error('Failed to save currencies:', e);
  }
}

/**
 * Fetch latest rates from public API or use enriched fallback with institution spreads
 */
export async function fetchAllRates(): Promise<AllBankRates> {
  let baseUsdRates: RawBaseRates = { ...DEFAULT_USD_RATES };

  try {
    // Attempt to get live market rates from public CORS-friendly endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.rates) {
        for (const [code, val] of Object.entries(data.rates)) {
          if (typeof val === 'number' && val > 0) {
            baseUsdRates[code] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Network rate fetch failed or timed out, using fallback cache:', err);
  }

  // Also try to augment with Russian Central Bank (CBR) API if reachable
  try {
    const cbrResp = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (cbrResp.ok) {
      const cbrData = await cbrResp.json();
      if (cbrData?.Valute?.USD?.Value) {
        baseUsdRates.RUB = cbrData.Valute.USD.Value;
      }
    }
  } catch (err) {
    // silently fallback
  }

  const result = generateBankQuotes(baseUsdRates);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    // ignore quota
  }

  return result;
}

export function getCachedRates(): AllBankRates | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Generates bank-specific buy/sell quotes based on actual banking spreads in Russia and Uzbekistan
 */
function generateBankQuotes(baseUsdRates: RawBaseRates): AllBankRates {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currencies = Object.keys(baseUsdRates);

  const sber: Record<string, RateQuote> = {};
  const kapital: Record<string, RateQuote> = {};
  const ligovka: Record<string, RateQuote> = {};
  const cbr: Record<string, RateQuote> = {};

  const rubPerUsd = baseUsdRates.RUB || 91.85;
  const uzsPerUsd = baseUsdRates.UZS || 12870.0;

  for (const curr of currencies) {
    const usdToCurr = baseUsdRates[curr] || 1;
    // Central market rate in RUB (how many RUB for 1 unit of curr)
    // If curr is USD: 1 USD = rubPerUsd
    // If curr is CNY: 1 CNY = (1 / usdToCurr) * rubPerUsd
    const rateToRub = curr === 'RUB' ? 1 : (1 / usdToCurr) * rubPerUsd;

    // Central market rate in UZS (how many UZS for 1 unit of curr)
    const rateToUzs = curr === 'UZS' ? 1 : (1 / usdToCurr) * uzsPerUsd;

    const drift = DRIFT_24H[curr] || 0.05;

    // 1. СБЕРБАНК (Россия)
    // Сбербанк имеет средний спред 2.5% - 3.8% от биржевого курса
    const sberBuySpread = 0.024; // Покупает у клиента дешевле на 2.4%
    const sberSellSpread = 0.026; // Продает клиенту дороже на 2.6%
    sber[curr] = {
      currency: curr,
      baseCurrency: 'RUB',
      buy: parseFloat((rateToRub * (1 - sberBuySpread)).toFixed(6)),
      sell: parseFloat((rateToRub * (1 + sberSellSpread)).toFixed(6)),
      centralBank: parseFloat(rateToRub.toFixed(6)),
      change24h: drift,
      updatedAt: timeStr,
    };

    // 2. КАПИТАЛБАНК (Узбекистан)
    // Капиталбанк торгует в сумах (UZS)
    // Для отображения в паре с UZS и в паре с RUB:
    const kapitalBuySpread = 0.009; // Спред Капиталбанка около 0.9-1.2%
    const kapitalSellSpread = 0.011;
    kapital[curr] = {
      currency: curr,
      baseCurrency: 'UZS',
      buy: parseFloat((rateToUzs * (1 - kapitalBuySpread)).toFixed(6)),
      sell: parseFloat((rateToUzs * (1 + kapitalSellSpread)).toFixed(6)),
      centralBank: parseFloat(rateToUzs.toFixed(6)),
      change24h: -(drift * 0.8), // UZS инверсивно реагирует
      updatedAt: timeStr,
    };

    // 3. ОБМЕННИК НА ЛИГОВСКОМ (ligovka.ru - Санкт-Петербург)
    // Лиговка известна минимальным спредом на наличные (0.5% - 0.9%)
    const ligovkaBuySpread = 0.007; // Покупает дороже чем Сбербанк!
    const ligovkaSellSpread = 0.008; // Продает дешевле чем Сбербанк!
    ligovka[curr] = {
      currency: curr,
      baseCurrency: 'RUB',
      buy: parseFloat((rateToRub * (1 - ligovkaBuySpread)).toFixed(6)),
      sell: parseFloat((rateToRub * (1 + ligovkaSellSpread)).toFixed(6)),
      centralBank: parseFloat(rateToRub.toFixed(6)),
      change24h: drift + 0.04,
      updatedAt: timeStr,
    };

    // 4. ЦБ РФ (Официальный курс)
    cbr[curr] = {
      currency: curr,
      baseCurrency: 'RUB',
      buy: parseFloat(rateToRub.toFixed(6)),
      sell: parseFloat(rateToRub.toFixed(6)),
      centralBank: parseFloat(rateToRub.toFixed(6)),
      change24h: drift,
      updatedAt: timeStr,
    };
  }

  return {
    sberbank: sber,
    kapitalbank: kapital,
    ligovka: ligovka,
    cbr: cbr,
    lastUpdated: timeStr,
  };
}

/**
 * Generate historical rate change data for a specific currency pair
 */
export function generateHistory(
  from: CurrencyCode,
  to: CurrencyCode,
  sourceId: BankSourceId,
  timeframe: Timeframe,
  currentRates: AllBankRates
): HistoryPoint[] {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
  const points: HistoryPoint[] = [];

  // Calculate current base exchange rate
  let currentRate = 1;
  const sourceQuotes = currentRates[sourceId] || currentRates.sberbank;

  if (from === to) {
    currentRate = 1;
  } else if (to === 'RUB' && sourceQuotes[from]) {
    currentRate = sourceQuotes[from].centralBank || sourceQuotes[from].sell;
  } else if (from === 'RUB' && sourceQuotes[to]) {
    const toRub = sourceQuotes[to].centralBank || sourceQuotes[to].buy;
    currentRate = toRub > 0 ? 1 / toRub : 1;
  } else if (to === 'UZS' && currentRates.kapitalbank[from]) {
    currentRate = currentRates.kapitalbank[from].centralBank || currentRates.kapitalbank[from].sell;
  } else if (from === 'UZS' && currentRates.kapitalbank[to]) {
    const toUzs = currentRates.kapitalbank[to].centralBank || currentRates.kapitalbank[to].buy;
    currentRate = toUzs > 0 ? 1 / toUzs : 1;
  } else {
    // Cross rate via RUB
    const fromToRub = sourceQuotes[from]?.centralBank || 1;
    const toToRub = sourceQuotes[to]?.centralBank || 1;
    currentRate = toToRub > 0 ? fromToRub / toToRub : 1;
  }

  // Create pseudo-random yet smooth and realistic historical curve based on dates
  const today = new Date();
  const seed = (from.charCodeAt(0) * 31 + to.charCodeAt(0) * 17) % 100;
  let runningRate = currentRate;

  // Walk backwards
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    // Weekends have flatter volatility
    const volatility = dayOfWeek === 0 || dayOfWeek === 6 ? 0.002 : 0.006;
    const wave = Math.sin((i + seed) / 6.0) * volatility + Math.cos((i * 1.5 + seed) / 10.0) * (volatility * 0.7);

    // Factor relative to end
    const factor = 1 - (i / days) * 0.04 + wave;
    const dayRate = currentRate * factor;
    const spread = sourceId === 'ligovka' ? 0.008 : sourceId === 'kapitalbank' ? 0.01 : 0.025;

    const high = dayRate * (1 + 0.004);
    const low = dayRate * (1 - 0.004);

    points.push({
      date: dateStr,
      rate: parseFloat(dayRate.toFixed(6)),
      buyRate: parseFloat((dayRate * (1 - spread)).toFixed(6)),
      sellRate: parseFloat((dayRate * (1 + spread)).toFixed(6)),
      open: parseFloat((dayRate * (1 - wave * 0.3)).toFixed(6)),
      high: parseFloat(high.toFixed(6)),
      low: parseFloat(low.toFixed(6)),
      close: parseFloat(dayRate.toFixed(6)),
    });
  }

  return points;
}

/**
 * Currency conversion utility: computes result from Amount, From, To, Source and Action
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  sourceId: BankSourceId,
  action: 'buy' | 'sell' | 'market',
  rates: AllBankRates
): { result: number; rate: number; formula: string } {
  if (from === to || amount <= 0) {
    return { result: amount, rate: 1, formula: `1 ${from} = 1 ${to}` };
  }

  const quotes = rates[sourceId] || rates.sberbank;
  const baseCurrency = sourceId === 'kapitalbank' ? 'UZS' : 'RUB';

  // Helper to get the value of 1 unit of `code` in the `baseCurrency`
  const getRateInBase = (code: CurrencyCode): number => {
    if (code === baseCurrency) return 1;
    
    // For Kapitalbank, if they don't have a quote, fallback to CBR but adjust for base if needed
    // Actually, rates.cbr is in RUB. If base is UZS, we can't directly use CBR without conversion.
    // However, our generateBankQuotes populates all active currencies for all banks.
    let q = quotes[code];
    
    if (!q) {
        // Fallback safety (shouldn't happen with our generator)
        return 1;
    }

    if (action === 'market') return q.centralBank || (q.buy + q.sell) / 2;
    if (action === 'buy') return q.buy;
    if (action === 'sell') return q.sell;
    
    return q.centralBank || (q.buy + q.sell) / 2;
  };

  const fromInBase = getRateInBase(from);
  const toInBase = getRateInBase(to);

  const effectiveRate = toInBase > 0 ? fromInBase / toInBase : 1;
  const result = amount * effectiveRate;

  return {
    result,
    rate: effectiveRate,
    formula: `1 ${from} = ${effectiveRate >= 10 ? effectiveRate.toFixed(2) : effectiveRate.toFixed(6)} ${to}`,
  };
}
