import React from 'react';
import { Home, ReceiptText, BarChart3, FileText, Settings } from 'lucide-react';

export type NavigationTab = 'home' | 'transactions' | 'analytics' | 'reports' | 'settings';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'transactions' as NavigationTab, label: 'Transactions', icon: ReceiptText },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileText },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative group transition-colors"
            >
              {/* Material 3 active pill indicator */}
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#006874]/15 dark:bg-[#006874]/30 text-[#006874] dark:text-[#97f0ff]'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate transition-all ${
                  isActive
                    ? 'font-bold text-[#006874] dark:text-[#97f0ff]'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
