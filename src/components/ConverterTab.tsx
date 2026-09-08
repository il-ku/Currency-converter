import React, { useState } from 'react';
import {
  BankSourceId,
  CurrencyCode,
  CurrencyInfo,
} from '../types/currency';
import { ALL_CURRENCIES, BANK_SOURCES } from '../data/currencies';
import { AllBankRates, convertCurrency } from '../services/ratesService';
import {
  ArrowDownUp,
  ExternalLink,
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface ConverterTabProps {
  rates: AllBankRates;
  trackedCurrencies: CurrencyCode[];
  selectedSource: BankSourceId;
  setSelectedSource: (s: BankSourceId) => void;
  onOpenChartForPair: (from: CurrencyCode, to: CurrencyCode) => void;
}

export const ConverterTab: React.FC<ConverterTabProps> = ({
  rates,
  trackedCurrencies,
  selectedSource,
  setSelectedSource,
  onOpenChartForPair,
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('RUB');
  const [action, setAction] = useState<'buy' | 'sell' | 'market'>('sell');

  // Filter currency objects based on tracked list
  const activeCurrencyObjects = ALL_CURRENCIES.filter((c) =>
    trackedCurrencies.includes(c.code)
  );

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

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const currentResult = convertCurrency(
    amount,
    fromCurrency,
    toCurrency,
    selectedSource,
    action,
    rates
  );

  // Compare results across the 3 main sources
  const sberResult = convertCurrency(amount, fromCurrency, toCurrency, 'sberbank', action, rates);
  const kapitalResult = convertCurrency(amount, fromCurrency, toCurrency, 'kapitalbank', action, rates);
  const ligovkaResult = convertCurrency(amount, fromCurrency, toCurrency, 'ligovka', action, rates);

  const fromMeta = getCurrencyMeta(fromCurrency);
  const toMeta = getCurrencyMeta(toCurrency);

  // Determine which is best depending on action
  // If selling currency to bank (action='buy'), higher result is best.
  // If buying currency from bank (action='sell'), lower cost or highest yield.
  const formatVal = (val: number, decimals: number = 2) => {
    return val.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Converter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Калькулятор конвертации</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Онлайн
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Расчет по реальным курсам отделений, онлайн-банков и касс
            </p>
          </div>

          {/* Action toggle: Buy vs Sell */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setAction('sell')}
              className={`px-3 py-1.5 rounded-lg transition ${
                action === 'sell'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Купить валюту
            </button>
            <button
              onClick={() => setAction('buy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                action === 'buy'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Продать валюту
            </button>
            <button
              onClick={() => setAction('market')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                action === 'market'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Курс ЦБ
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          {/* FROM input */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-emerald-500/70 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Вы отдаете</span>
              <span className="font-mono">{fromMeta.nameRu}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                placeholder="0.00"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {activeCurrencyObjects.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
            {/* Quick amount shortcuts */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] overflow-x-auto scrollbar-none">
              {[50, 100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded border transition ${
                    amount === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center -my-2 md:my-0">
            <button
              onClick={handleSwap}
              title="Поменять валюты местами"
              className="p-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition shadow-lg transform hover:rotate-180 duration-200"
            >
              <ArrowDownUp className="w-5 h-5" />
            </button>
          </div>

          {/* TO output */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 focus-within:border-emerald-500/70 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Вы получаете ({selectedSource === 'ligovka' ? 'Лиговка' : selectedSource === 'kapitalbank' ? 'Капиталбанк' : 'Сбербанк'})</span>
              <span className="font-mono">{toMeta.nameRu}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full text-2xl font-bold font-mono text-emerald-400 truncate">
                {formatVal(currentResult.result, toMeta.decimals)}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {activeCurrencyObjects.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span className="font-mono text-slate-300">{currentResult.formula}</span>
              <button
                onClick={() => onOpenChartForPair(fromCurrency, toCurrency)}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
              >
                <span>График пары</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Source comparison strip */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Сравнение выгоды между источниками за эту сумму:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Сбербанк */}
            <div
              onClick={() => setSelectedSource('sberbank')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                selectedSource === 'sberbank'
                  ? 'bg-emerald-950/40 border-emerald-500/70 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  🇷🇺 Сбербанк
                </span>
                {selectedSource === 'sberbank' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-white">
                {formatVal(sberResult.result, toMeta.decimals)} {toMeta.symbol}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Курс розницы РФ</div>
            </div>

            {/* Капитал банк */}
            <div
              onClick={() => setSelectedSource('kapitalbank')}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                selectedSource === 'kapitalbank'
                  ? 'bg-blue-950/40 border-blue-500/70 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  🇺🇿 Капиталбанк (UZ)
                </span>
                {selectedSource === 'kapitalbank' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-white">
                {formatVal(kapitalResult.result, toMeta.decimals)} {toMeta.symbol}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Курс в сумах / валюте</div>
            </div>

            {/* Лиговка */}
            <div
              onClick={() => setSelectedSource('ligovka')}
              className={`p-3 rounded-xl border cursor-pointer transition relative ${
                selectedSource === 'ligovka'
                  ? 'bg-amber-950/40 border-amber-500/70 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded-full">
                МИН. СПРЕД
              </span>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  🏦 Лиговка (СПб)
                </span>
                {selectedSource === 'ligovka' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-amber-300">
                {formatVal(ligovkaResult.result, toMeta.decimals)} {toMeta.symbol}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Опт/розница наличных</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Currency Board: Convert current amount into ALL tracked currencies */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{amount} {fromCurrency} во всех валютах</span>
              <span className="text-[11px] font-normal text-slate-400">
                (по котировкам {BANK_SOURCES.find((b) => b.id === selectedSource)?.shortName})
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Нажмите на любую карточку, чтобы переключить целевую валюту
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {activeCurrencyObjects.map((curr) => {
            const conv = convertCurrency(
              amount,
              fromCurrency,
              curr.code,
              selectedSource,
              action,
              rates
            );
            const isSelected = toCurrency === curr.code;

            return (
              <div
                key={curr.code}
                onClick={() => setToCurrency(curr.code)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{curr.flag}</span>
                    <span className="font-bold text-xs text-white">{curr.code}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{curr.symbol}</span>
                </div>
                <div className="font-mono font-bold text-sm text-emerald-300 truncate">
                  {formatVal(conv.result, curr.decimals)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {curr.nameRu}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
