import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Layers,
  Cpu,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ApkPromptGeneratorTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'prompt' | 'quick_apk' | 'android_studio'>('prompt');
  const [expandedSection, setExpandedSection] = useState<string | null>('prompt_preview');

  const MASTER_ANDROID_PROMPT = `Ты — ведущий Senior Android разработчик и архитектор мобильных систем (Kotlin, Jetpack Compose, Coroutines/Flow, Room, Retrofit, Clean Architecture).

Задача: Создай с нуля полноценное Android-приложение (конвертер и трекер валют) и скомпилируй готовый рабочий APK-файл.

==================== 1. ОСНОВНЫЕ ТРЕБОВАНИЯ ====================
• Платформа: Android (minSdk = 26, targetSdk = 34)
• Язык: Kotlin 2.0+
• UI: Jetpack Compose (Material 3) с адаптивной версткой для смартфонов и планшетов
• Архитектура: Clean Architecture + MVVM + Unidirectional Data Flow (UDF)
• DI: Hilt / Dagger
• Асинхронность: Kotlin Coroutines & StateFlow / SharedFlow
• База данных: Room (локальное хранилище котировок и истории для 100% оффлайн-работы)
• Фоновая синхронизация: WorkManager (периодический опрос котировок раз в 1-4 часа при наличии сети)

==================== 2. ИСТОЧНИКИ ДАННЫХ (КЛИЕНТЫ И ПАРСЕРЫ) ====================
Приложение должно подключаться и агрегировать котировки из трех конкретных финансовых источников:

1. СБЕРБАНК РОССИИ (sberbank.ru):
   - Модуль: SberbankRateDataSource
   - Получение котировок покупки и продажи безналичной валюты (СберБанк Онлайн) и наличных в отделениях.
   - Эндпоинт/Парсер: Обращение к внутреннему API котировок Сбера (https://www.sberbank.ru/portalserver/proxy/?pipe=shortCachePipe&url=https%3A%2F%2Fapi.sberbank.ru%2Fpublic%2Fv1%2Frates%2Fcurrencies) либо HTML-скрейпинг через Jsoup со страницы https://www.sberbank.ru/ru/quotes/currencies.
   - Фиксация спреда покупки и продажи в рублях (RUB).

2. КАПИТАЛ БАНК УЗБЕКИСТАНА (kapitalbank.uz):
   - Модуль: KapitalBankUzDataSource
   - Получение курсов обмена валют узбекского сума (UZS) к USD, RUB, EUR и др.
   - Эндпоинт/Парсер: Официальный JSON API Капиталбанка (https://kapitalbank.uz/api/v1/rates/ или https://api.cbu.uz/ru/arkhiv-kursov-valyut/json/ как резерв) либо HTML-парсинг Jsoup страницы https://kapitalbank.uz/ru/services/exchange-rates/.
   - Прямой расчет пар с UZS и кросс-курсов.

3. ОБМЕННИК НА ЛИГОВСКОМ (Санкт-Петербург, ligovka.ru):
   - Модуль: LigovkaExchangeDataSource
   - Получение розничных и оптовых наличных курсов обмена (минимальный спред в Санкт-Петербурге).
   - Парсер: OkHttp + Jsoup парсинг таблицы котировок с https://ligovka.ru/. Извлечение колонок «Покупка» и «Продажа» для основных и редких валют.
   - Обработка User-Agent для исключения блокировок (Android OkHttp client с заголовками браузера).

4. РЕЗЕРВНЫЙ АГРЕГАТОР (Fallbacks):
   - Центральный Банк РФ (https://www.cbr-xml-daily.ru/daily_json.js)
   - Открытый мировой FX API (https://open.er-api.com/v6/latest/USD) для получения рыночных базовых ставок без API-ключей.

==================== 3. ВАЛЮТЫ И ДИНАМИЧЕСКИЙ КАТАЛОГ ====================
• Предустановленные валюты (активны из коробки):
  1. RUB — Российский рубль 🇷🇺
  2. USD — Доллар США 🇺🇸
  3. UZS — Узбекский сум 🇺🇿
  4. KRW — Южнокорейская вона 🇰🇷
  5. CNY — Китайский юань 🇨🇳
  6. JPY — Японская иена 🇯🇵
  7. BRL — Бразильский реал 🇧🇷
• Модуль управления валютами (CurrencyManagementScreen):
  - Каталог из 30+ мировых валют (EUR, GBP, KZT, TRY, AED, GEL, BYN, THB, CHF, CAD и др.).
  - Поиск по коду (ISO 4217) и русскому названию.
  - Чекбоксы добавления в избранные/отслеживаемые.
  - Сохранение пользовательского набора в Room/DataStore.

==================== 4. ИСТОРИЯ КУРСОВ И ИНТЕРАКТИВНЫЙ ГРАФИК ====================
• Модуль: CurrencyPairChartScreen
• Выбор любой валютной пары (например: USD/RUB, USD/UZS, CNY/RUB, KRW/RUB, BRL/RUB).
• Выбор источника: Сбербанк vs Капиталбанк vs Лиговка vs ЦБ.
• Таймфреймы: 7 дней, 30 дней, 90 дней, 1 год.
• График:
  - Использовать библиотеку Vico Compose (com.patrykandpatryk.vico:compose-m3) либо MPAndroidChart.
  - Плавная кривая курса с градиентной заливкой.
  - Горизонтальные уровни Min / Max / Average.
  - Интерактивный тултип (Scrubbing / Touch Marker): при касании пальцем отображать точную дату, курс, цены покупки и продажи, % изменения к началу периода.
  - Таблица ежедневной динамики под графиком.

==================== 5. ЭКРАН КОНВЕРТЕРА-КАЛЬКУЛЯТОРА ====================
• Двусторонний мгновенный калькулятор: ввод суммы, выбор валют «Отдаю» и «Получаю», кнопка Swap.
• Режимы конвертации:
  - «Я покупаю валюту» (курс продажи банка)
  - «Я продаю валюту» (курс покупки банка)
  - «По курсу ЦБ»
• Сравнение выгоды: виджет «Где выгоднее обменять?», показывающий разницу в итоговой сумме между Сбербанком, Капиталбанком и Лиговкой.
• Мульти-конвертер: одновременный пересчет введенной суммы сразу во все отслеживаемые валюты (RUB, USD, UZS, KRW, CNY, JPY, BRL) в виде плитки карточек.

==================== 6. СБОРКА И ИНСТРУКЦИЯ ПО ГЕНЕРАЦИИ APK ====================
Напиши готовый файл сборки \`app/build.gradle.kts\`, манифест \`AndroidManifest.xml\` с нужными permissions (INTERNET, ACCESS_NETWORK_STATE), базовые Entity, DAO, Repository, Парсеры, ViewModel и Jetpack Compose UI компоненты.

Предоставь точную терминальную команду для компиляции итогового файла:
./gradlew assembleRelease
(или ./gradlew assembleDebug для мгновенной установки на устройство без цифровой подписи).
Путь к готовому APK файлу: app/build/outputs/apk/debug/app-debug.apk`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_ANDROID_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([MASTER_ANDROID_PROMPT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Android_Currency_Converter_APK_Prompt.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Генератор Android .APK проекта</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Мастер-промт и инструкция сборки APK
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Готовый к использованию инженерный промт для создания нативного Android приложения на Kotlin + Jetpack Compose
              с парсерами Сбербанка, Капиталбанка и Лиговки, Room БД и графиками.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано в буфер!' : 'Скопировать промт'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Скачать файл .md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Скачать .md</span>
            </button>
          </div>
        </div>

        {/* Subtabs for instruction variants */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveSubTab('prompt')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'prompt'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Текст мастер-промта
          </button>
          <button
            onClick={() => setActiveSubTab('quick_apk')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'quick_apk'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Сборка APK за 2 минуты (Capacitor / PWA)
          </button>
          <button
            onClick={() => setActiveSubTab('android_studio')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'android_studio'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Сборка в Android Studio (Gradle)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: The Master Prompt */}
      {activeSubTab === 'prompt' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Prompt_CurrencyConverter_Android_APK.md</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Kotlin • Compose • Room • Jsoup
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/40 max-h-[500px] overflow-y-auto">
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {MASTER_ANDROID_PROMPT}
              </pre>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Куда вставлять этот промт:</span>
            </div>
            <p>
              1. <strong>Claude 3.7 Sonnet / Cursor / Windsurf / Gemini CLI:</strong> Вставьте промт в диалог с ИИ в пустой папке проекта, и он сгенерирует полную структуру папок Android проекта с Kotlin файлами, разметкой и скриптами сборки.
            </p>
            <p>
              2. <strong>Android Studio:</strong> Откройте встроенный Gemini в Android Studio или создайте новый проект «Empty Compose Activity» и скормите этот промт в качестве спецификации.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Quick APK via Capacitor / PWA */}
      {activeSubTab === 'quick_apk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Способ 1: Превратить этот веб-конвертер в APK за 2 минуты</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Так как текущее веб-приложение уже оптимизировано под мобильный экран Android (responsive, кэширование, темная тема, офлайн-режим), его можно обернуть в нативный Android APK с помощью Capacitor или Bubblewrap.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="text-slate-400 mb-2 font-sans font-semibold text-emerald-400">
                Шаги в терминале (Node.js + Capacitor):
              </div>
              <div className="text-slate-300 space-y-1.5">
                <div className="text-slate-500"># 1. Собрать статический билд проекта</div>
                <div className="text-emerald-300">npm run build</div>
                <div className="text-slate-500 mt-2"># 2. Установить Capacitor Android</div>
                <div className="text-emerald-300">npm i @capacitor/core @capacitor/android @capacitor/cli -D</div>
                <div className="text-slate-500 mt-2"># 3. Инициализировать проект</div>
                <div className="text-emerald-300">npx cap init "CurrencyConverter" "com.valuta.converter" --web-dir dist</div>
                <div className="text-slate-500 mt-2"># 4. Добавить платформу Android</div>
                <div className="text-emerald-300">npx cap add android</div>
                <div className="text-slate-500 mt-2"># 5. Собрать и сгенерировать APK</div>
                <div className="text-emerald-300">cd android && ./gradlew assembleDebug</div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              <strong>Готово!</strong> Файл <code className="bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono">app-debug.apk</code> появится в папке <code className="bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono">android/app/build/outputs/apk/debug/</code> и может быть сразу передан на любой телефон Android.
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Android Studio (Gradle) */}
      {activeSubTab === 'android_studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Способ 2: Чистый нативный Kotlin проект в Android Studio</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Создание полноценного native Android приложения с парсерами Jsoup и Room DB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">
                1
              </div>
              <h4 className="font-bold text-white text-xs mb-1">Создайте проект</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                В Android Studio выберите <strong>New Project → Empty Activity (Jetpack Compose)</strong>. Назовите его, например, <em>CurrencyConverterApp</em>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs mb-2">
                2
              </div>
              <h4 className="font-bold text-white text-xs mb-1">Добавьте зависимости</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                В <code className="text-slate-300 font-mono">build.gradle.kts</code> добавьте:
                <br />• <code className="text-blue-300 font-mono">org.jsoup:jsoup:1.18.1</code>
                <br />• <code className="text-blue-300 font-mono">androidx.room:room-runtime:2.6.1</code>
                <br />• <code className="text-blue-300 font-mono">com.squareup.retrofit2:retrofit:2.11.0</code>
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-2">
                3
              </div>
              <h4 className="font-bold text-white text-xs mb-1">Скомпилируйте APK</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                В верхнем меню: <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>, либо выполните команду <code className="text-amber-300 font-mono">./gradlew assembleDebug</code>.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="text-slate-400 mb-1 text-[11px] font-sans">
              Пример AndroidManifest.xml (для работы с сайтами Сбербанка, Капиталбанка и Лиговки):
            </div>
            <pre className="text-slate-300 overflow-x-auto">
{`<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/Theme.CurrencyConverter">
        ...
    </application>
</manifest>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
