import React from 'react';
import { Sun, Moon, Smartphone, Monitor, Code2, Download } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  onOpenAndroidProject: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  darkMode,
  onToggleDarkMode,
  isDeviceFrame,
  onToggleDeviceFrame,
  onOpenAndroidProject,
  onInstallPWA,
  isInstallable,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#006874] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            ₹
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            {title}
          </span>
        </div>

        {/* Zone 2: Navigation Status / Mode */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Offline-Ready</span>
          <span>·</span>
          <span>Indian Rupees (₹)</span>
          <span>·</span>
          <span>Room DB Architecture</span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* PWA Install Button */}
          {isInstallable && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006874] text-white hover:bg-[#00525c] transition text-xs font-semibold shadow-xs"
              title="Install app to home screen"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Android Studio Source & APK Modal Trigger */}
          <button
            onClick={onOpenAndroidProject}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800 transition text-xs font-semibold"
            title="View Android Studio Source Code & APK guide"
          >
            <Code2 size={14} className="text-emerald-600" />
            <span className="hidden sm:inline">Android Studio Project</span>
            <span className="sm:hidden">Kotlin</span>
          </button>

          {/* Device Frame Viewport Switcher */}
          <button
            onClick={onToggleDeviceFrame}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title={isDeviceFrame ? 'Switch to Full Screen View' : 'Preview in Android Mobile Frame'}
            aria-label="Toggle device frame"
          >
            {isDeviceFrame ? <Monitor size={17} /> : <Smartphone size={17} />}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
};
