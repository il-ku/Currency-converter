import React, { useState } from 'react';
import {
  CurrencyCode,
  CurrencyInfo,
} from '../types/currency';
import { ALL_CURRENCIES } from '../data/currencies';
import { AllBankRates } from '../services/ratesService';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  LineChart,
  ShieldCheck,
  Building2,
  Coins,
  Store,
  HelpCircle,
} from 'lucide-react';

interface RatesTableTabProps {
  rates: AllBankRates;
  trackedCurrencies: CurrencyCode[];
  onOpenChartForPair: (from: CurrencyCode, to: CurrencyCode) => void;
  onOpenCurrencyManager: () => void;
}

export const RatesTableTab: React.FC<RatesTableTabProps> = ({
  rates,
  trackedCurrencies,
  onOpenChartForPair,
  onOpenCurrencyManager,
}) => {
  const [baseDisplay, setBaseDisplay] = useState<'RUB' | 'UZS' | 'USD'>('RUB');
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrencyMeta = (code: CurrencyCode): CurrencyInfo => {
    return (
      ALL_CURRENCIES.find((c) => c.code === code) || {
        code,
        name: code,
        nameRu: code,
        symbol: code,
        flag: '🌐',
        decimals: 2,
        isDefault: false,
      }
    );
  };

  // Filter out the base currency itself from the rows
  const displayCurrencies = trackedCurrencies
    .filter((code) => code !== baseDisplay)
    .filter((code) => {
      if (!searchQuery) return true;
      const meta = getCurrencyMeta(code);
      const q = searchQuery.toLowerCase();
      return (
        code.toLowerCase().includes(q) ||
        meta.nameRu.toLowerCase().includes(q) ||
        meta.name.toLowerCase().includes(q)
      );
    });

  const formatRate = (val: number | undefined, decimals = 2) => {
    if (val === undefined || isNaN(val)) return '—';
    return val.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner & Base Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Сводная таблица курсов</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Сбербанк • Капиталбанк • Лиговка
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Сравнение котировок покупки и продажи. Зеленым подсвечены лучшие предложения для вас.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Базовая валюта:</span>
            <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setBaseDisplay('RUB')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  baseDisplay === 'RUB'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇷🇺</span>
                <span>в Рублях (RUB)</span>
              </button>
              <button
                onClick={() => setBaseDisplay('UZS')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  baseDisplay === 'UZS'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇺🇿</span>
                <span>в Сумах (UZS)</span>
              </button>
              <button
                onClick={() => setBaseDisplay('USD')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  baseDisplay === 'USD'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇺🇸</span>
                <span>в USD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Source legend cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Сбербанк России (РФ)</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Курсы безналичного обмена в СберБанк Онлайн и кассах отделений.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Coins className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Капиталбанк (Узбекистан)</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Официальные курсы банка для UZS/USD/RUB и конверсий физлиц.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Лиговский обменник (СПб)</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Лиговский пер., 2. Самый узкий спред на наличную валюту в Санкт-Петербурге.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions toolbar */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Поиск валюты (USD, Вона, Юань, Реал)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 w-full max-w-xs focus:outline-none focus:border-emerald-500"
        />

        <button
          onClick={onOpenCurrencyManager}
          className="text-xs px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition whitespace-nowrap"
        >
          + Добавить другие валюты
        </button>
      </div>

      {/* Main Rates Table - Desktop */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Валюта</th>
                <th className="py-3 px-3 text-right">ЦБ (Биржа)</th>
                <th className="py-3 px-3 text-center border-l border-slate-800/80 bg-emerald-950/20 text-emerald-300">
                  Сбербанк (РФ)
                  <div className="font-normal lowercase text-[10px] text-emerald-400/80">Покупка / Продажа</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-slate-800/80 bg-blue-950/20 text-blue-300">
                  Капиталбанк (UZ)
                  <div className="font-normal lowercase text-[10px] text-blue-400/80">Покупка / Продажа</div>
                </th>
                <th className="py-3 px-3 text-center border-l border-slate-800/80 bg-amber-950/20 text-amber-300">
                  Лиговка (СПб)
                  <div className="font-normal lowercase text-[10px] text-amber-400/80">Покупка / Продажа</div>
                </th>
                <th className="py-3 px-3 text-center">24ч Динамика</th>
                <th className="py-3 px-4 text-center">График</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayCurrencies.map((code) => {
                const meta = getCurrencyMeta(code);

                // Quotes relative to RUB or UZS
                const sberQuote = rates.sberbank[code];
                const kapitalQuote = rates.kapitalbank[code];
                const ligovkaQuote = rates.ligovka[code];
                const cbrQuote = rates.cbr[code];

                // Check best buy (where YOU sell currency for the MOST rubles/soms)
                // Between Sber and Ligovka for RUB base:
                const sberBuy = sberQuote?.buy || 0;
                const ligovkaBuy = ligovkaQuote?.buy || 0;
                const bestRubBuy = Math.max(sberBuy, ligovkaBuy);

                // Best sell (where YOU buy currency for the LEAST rubles):
                const sberSell = sberQuote?.sell || 0;
                const ligovkaSell = ligovkaQuote?.sell || 0;
                const bestRubSell = Math.min(sberSell || Infinity, ligovkaSell || Infinity);

                const change = sberQuote?.change24h || 0;
                const isPositive = change >= 0;

                return (
                  <tr key={code} className="hover:bg-slate-800/50 transition group">
                    {/* Currency Name & Flag */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{meta.flag}</span>
                        <div>
                          <div className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                            <span>{meta.code}</span>
                            <span className="text-xs text-slate-400 font-mono">({meta.symbol})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">{meta.nameRu}</div>
                        </div>
                      </div>
                    </td>

                    {/* Official Benchmark */}
                    <td className="py-3.5 px-3 text-right text-slate-300 font-medium">
                      {baseDisplay === 'UZS'
                        ? formatRate(kapitalQuote?.centralBank, meta.code === 'KRW' ? 2 : 1)
                        : formatRate(cbrQuote?.centralBank, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                    </td>

                    {/* SBERBANK */}
                    <td className="py-3.5 px-3 border-l border-slate-800/80 bg-slate-950/20">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                            sberBuy === bestRubBuy && sberBuy > 0
                              ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 font-bold'
                              : 'text-slate-300'
                          }`}
                          title="Банк покупает у вас"
                        >
                          {formatRate(sberQuote?.buy, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                        </span>
                        <span className="text-slate-600">/</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                            sberSell === bestRubSell && sberSell > 0
                              ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 font-bold'
                              : 'text-slate-300'
                          }`}
                          title="Банк продает вам"
                        >
                          {formatRate(sberQuote?.sell, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                        </span>
                      </div>
                    </td>

                    {/* KAPITALBANK */}
                    <td className="py-3.5 px-3 border-l border-slate-800/80 bg-blue-950/10">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-blue-300 px-1.5 py-0.5 rounded text-xs font-semibold" title="Покупка в сумах">
                          {formatRate(kapitalQuote?.buy, meta.code === 'KRW' ? 2 : 1)}
                        </span>
                        <span className="text-slate-600">/</span>
                        <span className="text-blue-300 px-1.5 py-0.5 rounded text-xs font-semibold" title="Продажа в сумах">
                          {formatRate(kapitalQuote?.sell, meta.code === 'KRW' ? 2 : 1)}
                        </span>
                      </div>
                    </td>

                    {/* LIGOVKA (СПб) */}
                    <td className="py-3.5 px-3 border-l border-slate-800/80 bg-amber-950/10">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                            ligovkaBuy === bestRubBuy && ligovkaBuy > 0
                              ? 'text-amber-300 bg-amber-950/80 border border-amber-500/40 font-bold'
                              : 'text-slate-300'
                          }`}
                          title="Лиговка покупает у вас"
                        >
                          {formatRate(ligovkaQuote?.buy, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                        </span>
                        <span className="text-slate-600">/</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                            ligovkaSell === bestRubSell && ligovkaSell > 0
                              ? 'text-amber-300 bg-amber-950/80 border border-amber-500/40 font-bold'
                              : 'text-slate-300'
                          }`}
                          title="Лиговка продает вам"
                        >
                          {formatRate(ligovkaQuote?.sell, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                        </span>
                      </div>
                    </td>

                    {/* Change 24h */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {change.toFixed(2)}%
                        </span>
                      </span>
                    </td>

                    {/* Chart action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenChartForPair(code, baseDisplay)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-sans transition"
                        title={`Открыть график динамики ${code}/${baseDisplay}`}
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">График</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Rates List - Mobile (Cards) */}
      <div className="md:hidden space-y-4 pb-4">
        {displayCurrencies.map((code) => {
          const meta = getCurrencyMeta(code);

          const sberQuote = rates.sberbank[code];
          const kapitalQuote = rates.kapitalbank[code];
          const ligovkaQuote = rates.ligovka[code];
          const cbrQuote = rates.cbr[code];

          const sberBuy = sberQuote?.buy || 0;
          const ligovkaBuy = ligovkaQuote?.buy || 0;
          const bestRubBuy = Math.max(sberBuy, ligovkaBuy);

          const sberSell = sberQuote?.sell || 0;
          const ligovkaSell = ligovkaQuote?.sell || 0;
          const bestRubSell = Math.min(sberSell || Infinity, ligovkaSell || Infinity);

          const change = sberQuote?.change24h || 0;
          const isPositive = change >= 0;

          return (
            <div key={code} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
              {/* Card Header: Currency & CBR */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow-sm">{meta.flag}</span>
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-1.5">
                      <span>{meta.code}</span>
                      <span className="text-xs text-slate-400 font-mono">({meta.symbol})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">{meta.nameRu}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-0.5">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">ЦБ (Биржа)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono">
                    {baseDisplay === 'UZS'
                      ? formatRate(kapitalQuote?.centralBank, meta.code === 'KRW' ? 2 : 1)
                      : formatRate(cbrQuote?.centralBank, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                  </div>
                </div>
              </div>

              {/* Rates Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Sberbank */}
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-2.5 flex flex-col gap-2">
                  <div className="text-emerald-400 text-[10px] uppercase font-bold font-sans">Сбербанк (РФ)</div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-sans">Покупка:</span>
                    <span className={`font-semibold ${sberBuy === bestRubBuy && sberBuy > 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                      {formatRate(sberQuote?.buy, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-sans">Продажа:</span>
                    <span className={`font-semibold ${sberSell === bestRubSell && sberSell > 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                      {formatRate(sberQuote?.sell, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                    </span>
                  </div>
                </div>

                {/* Kapitalbank */}
                <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-2.5 flex flex-col gap-2">
                  <div className="text-blue-400 text-[10px] uppercase font-bold font-sans">Капиталбанк (UZ)</div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-sans">Покупка:</span>
                    <span className="font-semibold text-slate-200">
                      {formatRate(kapitalQuote?.buy, meta.code === 'KRW' ? 2 : 1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-sans">Продажа:</span>
                    <span className="font-semibold text-slate-200">
                      {formatRate(kapitalQuote?.sell, meta.code === 'KRW' ? 2 : 1)}
                    </span>
                  </div>
                </div>

                {/* Ligovka */}
                <div className="col-span-2 bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex justify-between items-center">
                  <div className="text-amber-400 text-[10px] uppercase font-bold font-sans">Лиговка (СПб)</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px] font-sans">Пок:</span>
                      <span className={`font-semibold ${ligovkaBuy === bestRubBuy && ligovkaBuy > 0 ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                        {formatRate(ligovkaQuote?.buy, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px] font-sans">Прод:</span>
                      <span className={`font-semibold ${ligovkaSell === bestRubSell && ligovkaSell > 0 ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                        {formatRate(ligovkaQuote?.sell, meta.code === 'KRW' || meta.code === 'JPY' ? 4 : 2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Change & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold font-sans">24ч Динамика:</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
                  </span>
                </div>

                <button
                  onClick={() => onOpenChartForPair(code, baseDisplay)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold font-sans transition"
                >
                  <LineChart className="w-4 h-4" />
                  <span>График</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
