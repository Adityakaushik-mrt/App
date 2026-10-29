import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidDeviceShellProps {
  children: React.ReactNode;
  isDeviceFrame: boolean;
  currentTime?: string;
}

export const AndroidDeviceShell: React.FC<AndroidDeviceShellProps> = ({
  children,
  isDeviceFrame,
  currentTime = '12:00',
}) => {
  if (!isDeviceFrame) {
    return <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">{children}</div>;
  }

  return (
    <div className="py-6 flex justify-center items-center min-h-[calc(100vh-56px)]">
      {/* Realistic Android Phone Bezel */}
      <div className="w-full max-w-[412px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-slate-800 relative flex flex-col h-[860px] overflow-hidden">
        
        {/* Android Punch Hole Camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full z-50 border border-slate-800 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
        </div>

        {/* Screen Container */}
        <div className="w-full h-full bg-[#f4f6f8] dark:bg-[#0f1416] rounded-[38px] flex flex-col overflow-hidden relative">
          
          {/* Android Status Bar */}
          <div className="h-7 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 select-none shrink-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Signal size={12} />
              <span className="text-[10px] font-bold">5G</span>
              <Wifi size={12} />
              <BatteryMedium size={14} className="text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          {/* Inner Content Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-20 no-scrollbar">
            {children}
          </div>

          {/* Android Bottom Gesture Navigation Pill */}
          <div className="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center pointer-events-none z-50">
            <div className="w-28 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
