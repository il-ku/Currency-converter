import React from 'react';
import {
  BankSourceId,
  CurrencyCode,
} from '../types/currency';
import { BANK_SOURCES } from '../data/currencies';
import { PWAInstallButton } from './PWAInstallButton';
import {
  RefreshCw,
  Smartphone,
  Monitor,
  SlidersHorizontal,
  FileCode2,
  TrendingUp,
  ArrowRightLeft,
  ListFilter,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'converter' | 'rates' | 'chart';
  setActiveTab: (tab: 'converter' | 'rates' | 'chart') => void;
  selectedSource: BankSourceId;
  setSelectedSource: (s: BankSourceId) => void;
  isMobileView: boolean;
  setIsMobileView: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  onOpenCurrencyManager: () => void;
  trackedCurrenciesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedSource,
  setSelectedSource,
  isMobileView,
  setIsMobileView,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onOpenCurrencyManager,
  trackedCurrenciesCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top system row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
            ₽
          </span>
          <div>
            <span className="font-semibold text-white text-sm">Валютный Радар</span>
            <span className="hidden sm:inline text-slate-400 ml-2">
              Сбербанк • Капиталбанк • Лиговка
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">
            Обновлено: <strong className="text-slate-200">{lastUpdated || 'только что'}</strong>
          </span>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Обновить котировки"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
          </button>

          <button
            onClick={onOpenCurrencyManager}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Валюты ({trackedCurrenciesCount})</span>
          </button>

          <button
            onClick={() => setIsMobileView(!isMobileView)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isMobileView ? 'Развернуть на весь экран' : 'Включить рамку Android смартфона'}
          >
            {isMobileView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">Десктоп</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Android вид</span>
              </>
            )}
          </button>
          
          <PWAInstallButton />
        </div>
      </div>

      {/* Primary Navigation & Bank Sources Filter */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'converter'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Конвертер
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'rates'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Котировки банков
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'chart'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Графики пар
          </button>
        </nav>

        {/* Bank quick filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          <span className="text-slate-400 mr-1 text-[11px] whitespace-nowrap">Источник:</span>
          {BANK_SOURCES.map((bank) => {
            const isSelected = selectedSource === bank.id;
            return (
              <button
                key={bank.id}
                onClick={() => setSelectedSource(bank.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-400/80 text-white shadow-sm'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{bank.countryFlag}</span>
                <span>{bank.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
