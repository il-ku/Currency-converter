import React, { useState, useMemo } from 'react';
import {
  BankSourceId,
  CurrencyCode,
  CurrencyInfo,
  HistoryPoint,
  Timeframe,
} from '../types/currency';
import { ALL_CURRENCIES, BANK_SOURCES } from '../data/currencies';
import { AllBankRates, generateHistory } from '../services/ratesService';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  TableProperties,
} from 'lucide-react';

interface ChartTabProps {
  rates: AllBankRates;
  trackedCurrencies: CurrencyCode[];
  initialPair?: { from: CurrencyCode; to: CurrencyCode };
  selectedSource: BankSourceId;
  setSelectedSource: (s: BankSourceId) => void;
}

export const ChartTab: React.FC<ChartTabProps> = ({
  rates,
  trackedCurrencies,
  initialPair,
  selectedSource,
  setSelectedSource,
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(
    initialPair?.from || 'USD'
  );
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(
    initialPair?.to || 'RUB'
  );
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<HistoryPoint | null>(null);
  const [showHistoryTable, setShowHistoryTable] = useState(true);

  // Active currencies
  const activeCurrencies = ALL_CURRENCIES.filter((c) =>
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

  const fromMeta = getCurrencyMeta(fromCurrency);
  const toMeta = getCurrencyMeta(toCurrency);

  // Generate historical data
  const historyPoints = useMemo(() => {
    return generateHistory(
      fromCurrency,
      toCurrency,
      selectedSource,
      timeframe,
      rates
    );
  }, [fromCurrency, toCurrency, selectedSource, timeframe, rates]);

  // Calculations for stats
  const { minVal, maxVal, avgVal, startVal, endVal, changePercent, changeAbs } =
    useMemo(() => {
      if (!historyPoints.length) {
        return {
          minVal: 0,
          maxVal: 0,
          avgVal: 0,
          startVal: 0,
          endVal: 0,
          changePercent: 0,
          changeAbs: 0,
        };
      }
      const ratesList = historyPoints.map((p) => p.rate);
      const min = Math.min(...ratesList);
      const max = Math.max(...ratesList);
      const sum = ratesList.reduce((acc, r) => acc + r, 0);
      const avg = sum / ratesList.length;
      const start = historyPoints[0].rate;
      const end = historyPoints[historyPoints.length - 1].rate;
      const abs = end - start;
      const pct = start > 0 ? (abs / start) * 100 : 0;

      return {
        minVal: min,
        maxVal: max,
        avgVal: avg,
        startVal: start,
        endVal: end,
        changePercent: pct,
        changeAbs: abs,
      };
    }, [historyPoints]);

  // SVG Chart path calculation
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  const chartInnerWidth = svgWidth - padding.left - padding.right;
  const chartInnerHeight = svgHeight - padding.top - padding.bottom;

  // Add 5% headroom on y scale
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.05;
  const yMax = maxVal + range * 0.05;
  const yRange = yMax - yMin;

  const pointsCoords = useMemo(() => {
    if (!historyPoints.length) return [];
    return historyPoints.map((p, idx) => {
      const x = padding.left + (idx / (historyPoints.length - 1)) * chartInnerWidth;
      const y = padding.top + chartInnerHeight - ((p.rate - yMin) / yRange) * chartInnerHeight;
      return { x, y, point: p };
    });
  }, [historyPoints, chartInnerWidth, chartInnerHeight, padding, yMin, yRange]);

  const linePath = useMemo(() => {
    if (!pointsCoords.length) return '';
    return pointsCoords.reduce((acc, curr, i) => {
      return i === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
    }, '');
  }, [pointsCoords]);

  const areaPath = useMemo(() => {
    if (!pointsCoords.length) return '';
    const firstX = pointsCoords[0].x;
    const lastX = pointsCoords[pointsCoords.length - 1].x;
    const baseY = padding.top + chartInnerHeight;
    return `${linePath} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
  }, [linePath, pointsCoords, padding, chartInnerHeight]);

  const isPositiveChange = changePercent >= 0;

  const formatNumber = (num: number) => {
    if (num >= 100) return num.toFixed(2);
    if (num >= 1) return num.toFixed(3);
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Pair Selector, Source Selector, Timeframe */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Pair selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Пара:</span>
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {/* From currency */}
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {activeCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />

              {/* To currency */}
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {activeCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Pairs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Частые:</span>
              {[
                ['USD', 'RUB'],
                ['USD', 'UZS'],
                ['CNY', 'RUB'],
                ['KRW', 'RUB'],
                ['BRL', 'RUB'],
                ['RUB', 'UZS'],
              ].map(([f, t]) => (
                <button
                  key={`${f}-${t}`}
                  onClick={() => {
                    setFromCurrency(f);
                    setToCurrency(t);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                    fromCurrency === f && toCurrency === t
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {f}/{t}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Период:</span>
            <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              {[
                { id: '7d', label: '7 дней' },
                { id: '30d', label: '30 дней' },
                { id: '90d', label: '3 месяца' },
                { id: '1y', label: '1 год' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as Timeframe)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === tf.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Source badge selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Котировки источника:</span>
          {BANK_SOURCES.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedSource(bank.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border ${
                selectedSource === bank.id
                  ? 'bg-slate-800 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{bank.countryFlag}</span>
              <span>{bank.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400">Текущий курс</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {formatNumber(endVal)} {toMeta.symbol}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            1 {fromCurrency} = {formatNumber(endVal)} {toCurrency}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400">Динамика за период</div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 flex items-center gap-1 ${
              isPositiveChange ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositiveChange ? '+' : ''}
              {changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {isPositiveChange ? '+' : ''}
            {formatNumber(changeAbs)} {toMeta.symbol}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400">Максимум периода</div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
            {formatNumber(maxVal)} {toMeta.symbol}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Пиковое значение</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400">Минимум периода</div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
            {formatNumber(minVal)} {toMeta.symbol}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Нижнее значение</div>
        </div>
      </div>

      {/* SVG Interactive Chart Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>{fromMeta.flag}</span>
              <span>
                График котировок {fromCurrency}/{toCurrency}
              </span>
              <span className="text-xs font-normal text-slate-400">
                ({BANK_SOURCES.find((b) => b.id === selectedSource)?.shortName})
              </span>
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {hoveredPoint ? (
              <span className="text-emerald-400 font-semibold">
                {hoveredPoint.date}: {formatNumber(hoveredPoint.rate)} {toMeta.symbol}
              </span>
            ) : (
              <span>Наведите на график для деталей</span>
            )}
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                {/* Emerald/cyan gradient fill for area */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + chartInnerHeight * ratio;
                const value = yMax - ratio * yRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4,4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {formatNumber(value)}
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Main Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & Interactive hover circles */}
              {pointsCoords.map(({ x, y, point }, i) => {
                const isHovered = hoveredPoint?.date === point.date;
                // Render visible markers on every few points or on hover
                const showPointMarker =
                  isHovered ||
                  i === 0 ||
                  i === pointsCoords.length - 1 ||
                  i % Math.ceil(pointsCoords.length / 8) === 0;

                return (
                  <g
                    key={point.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(point)}
                  >
                    {/* Invisible fat hit area for mouse targeting */}
                    <circle cx={x} cy={y} r="14" fill="transparent" />

                    {showPointMarker && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? '6' : '3'}
                        fill={isHovered ? '#34d399' : '#10b981'}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    )}

                    {/* X-axis date labels */}
                    {showPointMarker && (
                      <text
                        x={x}
                        y={svgHeight - 12}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {point.date.slice(5)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Hover indicator vertical line and tooltip */}
              {hoveredPoint && (
                (() => {
                  const target = pointsCoords.find(
                    (p) => p.point.date === hoveredPoint.date
                  );
                  if (!target) return null;
                  return (
                    <g>
                      <line
                        x1={target.x}
                        y1={padding.top}
                        x2={target.x}
                        y2={padding.top + chartInnerHeight}
                        stroke="#34d399"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                      <circle
                        cx={target.x}
                        cy={target.y}
                        r="6"
                        fill="#34d399"
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })()
              )}
            </svg>
          </div>
        </div>

        {/* Hovered Point Card */}
        {hoveredPoint && (
          <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Дата: {hoveredPoint.date}</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-slate-400">Курс: </span>
                <strong className="text-emerald-300">
                  {formatNumber(hoveredPoint.rate)} {toMeta.symbol}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Покупка: </span>
                <strong className="text-slate-200">
                  {formatNumber(hoveredPoint.buyRate)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Продажа: </span>
                <strong className="text-slate-200">
                  {formatNumber(hoveredPoint.sellRate)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily History Table Collapsible */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div
          onClick={() => setShowHistoryTable(!showHistoryTable)}
          className="p-4 bg-slate-950/60 flex items-center justify-between cursor-pointer hover:bg-slate-950 transition"
        >
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">
              История котировок по дням ({historyPoints.length} записей)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            {showHistoryTable ? 'Свернуть' : 'Развернуть'}
          </span>
        </div>

        {showHistoryTable && (
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 font-sans">Дата</th>
                  <th className="py-2.5 px-3 text-right">Курс (Средний)</th>
                  <th className="py-2.5 px-3 text-right">Покупка</th>
                  <th className="py-2.5 px-3 text-right">Продажа</th>
                  <th className="py-2.5 px-3 text-right">Мин / Макс дня</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...historyPoints].reverse().map((pt) => (
                  <tr key={pt.date} className="hover:bg-slate-800/40">
                    <td className="py-2 px-4 text-slate-300 font-sans">{pt.date}</td>
                    <td className="py-2 px-3 text-right text-emerald-300 font-bold">
                      {formatNumber(pt.rate)} {toMeta.symbol}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatNumber(pt.buyRate)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatNumber(pt.sellRate)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 text-[11px]">
                      {formatNumber(pt.low)} – {formatNumber(pt.high)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
