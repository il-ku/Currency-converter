import React from 'react';
import { Wifi, Signal, Battery, ArrowLeft, Home, Square } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileView: boolean;
  currentTime: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  isMobileView,
  currentTime,
}) => {
  if (!isMobileView) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="py-6 px-2 flex justify-center items-start min-h-screen bg-slate-950">
      {/* Android Device Chassis */}
      <div className="w-full max-w-[440px] bg-slate-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 relative flex flex-col min-h-[850px] max-h-[92vh]">
        {/* Top Camera Punch Hole & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-40">
          <div className="w-12 h-1 bg-slate-700/80 rounded-full" />
          <div className="w-3.5 h-3.5 bg-slate-950 rounded-full border-2 border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-900/60 rounded-full" />
          </div>
        </div>

        {/* Android Status Bar */}
        <div className="h-7 px-4 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-300 z-30 select-none">
          <span>{currentTime || '09:41'}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Content Container with rounded inner corners */}
        <div className="flex-1 bg-slate-950 rounded-[32px] overflow-y-auto overflow-x-hidden relative border border-slate-800/80 scrollbar-none flex flex-col">
          <div className="flex-1 pb-8">{children}</div>
        </div>

        {/* Android Bottom Navigation Gesture Pill */}
        <div className="h-6 flex items-center justify-center pt-2">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
