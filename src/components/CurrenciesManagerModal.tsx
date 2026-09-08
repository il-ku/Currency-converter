import React, { useState } from 'react';
import { CurrencyCode, CurrencyInfo } from '../types/currency';
import { ALL_CURRENCIES } from '../data/currencies';
import {
  X,
  Search,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CurrenciesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackedCurrencies: CurrencyCode[];
  onSave: (currencies: CurrencyCode[]) => void;
}

export const CurrenciesManagerModal: React.FC<CurrenciesManagerModalProps> = ({
  isOpen,
  onClose,
  trackedCurrencies,
  onSave,
}) => {
  const [selected, setSelected] = useState<CurrencyCode[]>(trackedCurrencies);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleToggle = (code: CurrencyCode) => {
    if (selected.includes(code)) {
      // Don't let them remove all currencies, keep at least 2
      if (selected.length <= 2) return;
      setSelected(selected.filter((c) => c !== code));
    } else {
      setSelected([...selected, code]);
    }
  };

  const handleReset = () => {
    // Reset to user's 7 mandatory currencies: RUB, USD, UZS, KRW, CNY, JPY, BRL
    const defaults = ['RUB', 'USD', 'UZS', 'KRW', 'CNY', 'JPY', 'BRL'];
    setSelected(defaults);
  };

  const handleApply = () => {
    onSave(selected);
    onClose();
  };

  const filteredCurrencies = ALL_CURRENCIES.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.nameRu.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>Управление списком валют</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                Выбрано: {selected.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Включите или выключите валюты для отслеживания в конвертере и таблицах
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Reset row */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или коду (USD, Тенге, EUR)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0"
            title="Сбросить к базовым 7 валютам (RUB, USD, UZS, KRW, CNY, JPY, BRL)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Базовые 7</span>
          </button>
        </div>

        {/* Currencies Grid / List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Доступные мировые валюты
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCurrencies.map((c) => {
              const isChecked = selected.includes(c.code);
              return (
                <div
                  key={c.code}
                  onClick={() => handleToggle(c.code)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/70 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span className={isChecked ? 'text-emerald-300' : 'text-slate-300'}>
                          {c.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.symbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {c.nameRu}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Активно: <strong className="text-emerald-400">{selected.length}</strong> валют
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              Применить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
