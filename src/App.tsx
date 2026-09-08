import React, { useState, useEffect } from 'react';
import {
  BankSourceId,
  CurrencyCode,
} from './types/currency';
import {
  AllBankRates,
  fetchAllRates,
  getCachedRates,
  getStoredTrackedCurrencies,
  saveTrackedCurrencies,
} from './services/ratesService';
import { Header } from './components/Header';
import { ConverterTab } from './components/ConverterTab';
import { RatesTableTab } from './components/RatesTableTab';
import { ChartTab } from './components/ChartTab';
import { CurrenciesManagerModal } from './components/CurrenciesManagerModal';
import { MobileFrame } from './components/MobileFrame';
import {
  ArrowRightLeft,
  ListFilter,
  TrendingUp,
  WifiOff,
} from 'lucide-react';

export default function App() {
  const [trackedCurrencies, setTrackedCurrencies] = useState<CurrencyCode[]>(
    getStoredTrackedCurrencies()
  );
  const [selectedSource, setSelectedSource] = useState<BankSourceId>('sberbank');
  const [activeTab, setActiveTab] = useState<'converter' | 'rates' | 'chart'>('converter');
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedChartPair, setSelectedChartPair] = useState<{ from: CurrencyCode; to: CurrencyCode }>({
    from: 'USD',
    to: 'RUB',
  });

  const [rates, setRates] = useState<AllBankRates | null>(getCachedRates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState('');

  // Clock for Android status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load live rates on mount
  const loadRates = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAllRates();
      setRates(data);
    } catch (e) {
      console.error('Failed to load rates', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRates();
    // Auto-refresh every 60 seconds
    const timer = setInterval(() => {
      loadRates();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveCurrencies = (newCurrencies: CurrencyCode[]) => {
    setTrackedCurrencies(newCurrencies);
    saveTrackedCurrencies(newCurrencies);
  };

  const handleOpenChartForPair = (from: CurrencyCode, to: CurrencyCode) => {
    setSelectedChartPair({ from, to });
    setActiveTab('chart');
  };

  // If initial rates not yet ready, show an initial loading state
  if (!rates) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl mb-4 animate-pulse">
          ₽
        </div>
        <h2 className="text-white font-bold text-base">Загрузка котировок валют...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Подключение к Сбербанку, Капиталбанку и Лиговке...
        </p>
      </div>
    );
  }

  const appContent = (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Offline banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-xs py-1.5 px-4 flex items-center justify-center gap-2 font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Офлайн-режим. Используются сохраненные локальные курсы валют.</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        isMobileView={isMobileView}
        setIsMobileView={setIsMobileView}
        onRefresh={loadRates}
        isRefreshing={isRefreshing}
        lastUpdated={rates.lastUpdated}
        onOpenCurrencyManager={() => setIsCurrencyModalOpen(true)}
        trackedCurrenciesCount={trackedCurrencies.length}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'converter' && (
          <ConverterTab
            rates={rates}
            trackedCurrencies={trackedCurrencies}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            onOpenChartForPair={handleOpenChartForPair}
          />
        )}

        {activeTab === 'rates' && (
          <RatesTableTab
            rates={rates}
            trackedCurrencies={trackedCurrencies}
            onOpenChartForPair={handleOpenChartForPair}
            onOpenCurrencyManager={() => setIsCurrencyModalOpen(true)}
          />
        )}

        {activeTab === 'chart' && (
          <ChartTab
            rates={rates}
            trackedCurrencies={trackedCurrencies}
            initialPair={selectedChartPair}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (for quick thumb access) */}
      <div className="md:hidden sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'converter' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Конвертер</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'rates' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Котировки</span>
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'chart' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>График</span>
        </button>
      </div>

      {/* Currency Catalog Modal */}
      <CurrenciesManagerModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        trackedCurrencies={trackedCurrencies}
        onSave={handleSaveCurrencies}
      />
    </div>
  );

  return (
    <MobileFrame isMobileView={isMobileView} currentTime={currentTime}>
      {appContent}
    </MobileFrame>
  );
}
