import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const isIframe = window !== window.parent;

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable && !isIframe) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Установить App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-4 pr-6">Установка приложения</h3>
            
            <div className="text-sm text-slate-300 mb-6 space-y-4 leading-relaxed">
              {isIframe ? (
                <>
                  <p className="text-amber-400 font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Вы находитесь в режиме предпросмотра.
                  </p>
                  <p>Чтобы установить приложение на телефон:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-slate-400">
                    <li>Скопируйте ссылку на приложение (или откройте в новой вкладке).</li>
                    <li>Откройте её в браузере (Chrome / Safari) на вашем смартфоне.</li>
                    <li>Нажмите эту же кнопку установки там, либо воспользуйтесь меню браузера.</li>
                  </ol>
                </>
              ) : isIOS ? (
                <>
                  <p>Чтобы установить приложение на домашний экран iPhone/iPad:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-slate-400">
                    <li>Нажмите кнопку <strong>Поделиться</strong> в меню Safari (квадрат со стрелкой вверх).</li>
                    <li>Прокрутите вниз и выберите <strong>«На экран "Домой"»</strong> (Add to Home Screen).</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>Ваш браузер заблокировал автоматическую установку.</p>
                  <p>Для ручной установки:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-slate-400">
                    <li>Откройте меню браузера (обычно три точки в правом верхнем углу).</li>
                    <li>Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</li>
                  </ol>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-sm font-bold text-white transition"
            >
              Понятно, закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};
