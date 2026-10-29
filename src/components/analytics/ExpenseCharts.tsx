import React, { useState } from 'react';
import { Expense, CategoryItem } from '../../types/expense';
import { formatRupees } from '../../utils/currency';
import { isoToDDMMYYYY } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

interface ExpenseChartsProps {
  expenses: Expense[];
  categories: CategoryItem[];
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, categories }) => {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | 'all'>('7days');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter expenses according to timeframe and category
  const now = new Date();
  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) {
      return false;
    }
    if (timeframe === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      const minDate = d7.toISOString().split('T')[0];
      return e.date >= minDate;
    } else if (timeframe === '30days') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 29);
      const minDate = d30.toISOString().split('T')[0];
      return e.date >= minDate;
    }
    return true;
  });

  const totalFilteredPaise = filteredExpenses.reduce((sum, e) => sum + e.amountInPaise, 0);

  // 1. Category Pie Data
  const categoryTotalsMap = new Map<string, number>();
  filteredExpenses.forEach((e) => {
    categoryTotalsMap.set(e.category, (categoryTotalsMap.get(e.category) || 0) + e.amountInPaise);
  });

  const pieData = Array.from(categoryTotalsMap.entries())
    .map(([catName, paise]) => {
      const catObj = categories.find((c) => c.name === catName);
      const percent = totalFilteredPaise > 0 ? (paise / totalFilteredPaise) * 100 : 0;
      return {
        category: catName,
        paise,
        percent,
        color: catObj ? catObj.color : '#006874',
        iconName: catObj ? catObj.iconName : 'Tag',
      };
    })
    .sort((a, b) => b.paise - a.paise);

  // 2. Daily Bar Chart Data (last 7 or 14 days)
  const daysToShow = timeframe === '30days' ? 14 : 7;
  const dailyBarData: { label: string; date: string; paise: number }[] = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const dayTotal = filteredExpenses
      .filter((e) => e.date === iso)
      .reduce((sum, e) => sum + e.amountInPaise, 0);

    dailyBarData.push({
      label: `${dayName} ${dayNumber}`,
      date: iso,
      paise: dayTotal,
    });
  }

  const maxDailyPaise = Math.max(...dailyBarData.map((d) => d.paise), 1000);

  // 3. Spending Trends (Cumulative / daily points for line chart)
  const linePoints = dailyBarData;
  const maxTrendPaise = Math.max(...linePoints.map((d) => d.paise), 1000);

  // 4. Monthly Comparison Bar Chart (Past 4 months)
  const monthlyData: { monthName: string; yearMonth: string; paise: number }[] = [];
  for (let m = 3; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const monthPaise = expenses
      .filter((e) => e.date.startsWith(ym))
      .reduce((sum, e) => sum + e.amountInPaise, 0);
    monthlyData.push({
      monthName,
      yearMonth: ym,
      paise: monthPaise,
    });
  }
  const maxMonthPaise = Math.max(...monthlyData.map((m) => m.paise), 1000);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Timeframe
          </div>
          {/* Segmented button control */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                timeframe === '7days'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                timeframe === '30days'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                timeframe === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Category filter dropdown */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#006874] w-full max-w-xs"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart 1: Category Breakdown Donut / Pie Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category-Wise Spending
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total: <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{formatRupees(totalFilteredPaise)}</span>
            </p>
          </div>
        </div>

        {pieData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No expenses recorded for this timeframe.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Donut */}
            <div className="relative flex justify-center items-center">
              <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
                {(() => {
                  let cumulativePercent = 0;
                  return pieData.map((slice, index) => {
                    const strokeDasharray = `${(slice.percent * 2 * Math.PI * 70) / 100} ${(100 - slice.percent) * 2 * Math.PI * 70 / 100}`;
                    const strokeDashoffset = -((cumulativePercent * 2 * Math.PI * 70) / 100);
                    cumulativePercent += slice.percent;

                    const isHovered = activePieIndex === index;

                    return (
                      <circle
                        key={slice.category}
                        cx="110"
                        cy="110"
                        r="70"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? '32' : '26'}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                        onClick={() => setActivePieIndex(activePieIndex === index ? null : index)}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Summary */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {activePieIndex !== null && pieData[activePieIndex] ? (
                  <>
                    <span className="text-[11px] text-slate-500 truncate max-w-[110px]">
                      {pieData[activePieIndex].category}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupees(pieData[activePieIndex].paise)}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {pieData[activePieIndex].percent.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400">Total</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatRupees(totalFilteredPaise)}
                    </span>
                    <span className="text-[10px] text-slate-400">{pieData.length} categories</span>
                  </>
                )}
              </div>
            </div>

            {/* Category Legend & List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pieData.map((item, idx) => (
                <div
                  key={item.category}
                  onMouseEnter={() => setActivePieIndex(idx)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    activePieIndex === idx
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatRupees(item.paise)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 tabular-nums">
                      ({item.percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart 2: Daily Expenses Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Expense Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily spending pattern across recent days
            </p>
          </div>
        </div>

        <div className="h-48 flex items-end gap-2 pt-6 pb-2">
          {dailyBarData.map((bar) => {
            const heightPercent = maxDailyPaise > 0 ? (bar.paise / maxDailyPaise) * 100 : 0;
            const isTodayBar = bar.date === now.toISOString().split('T')[0];

            return (
              <div key={bar.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Floating tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-10 tabular-nums">
                  {formatRupees(bar.paise)}
                </div>

                <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${Math.max(heightPercent, bar.paise > 0 ? 6 : 2)}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isTodayBar
                        ? 'bg-[#006874]'
                        : bar.paise > 0
                        ? 'bg-[#26a69a]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {bar.label.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">
                  {bar.label.split(' ')[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 3 & 4 Grid: Spending Trends Line Chart + Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends Line Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Spending Trend
          </h3>
          <p className="text-xs text-slate-500 mb-4">Fluctuation across tracked days</p>

          <div className="h-44 relative flex items-center justify-center">
            {linePoints.length > 1 ? (
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006874" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#006874" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Path calculation */}
                {(() => {
                  const width = 300;
                  const height = 100;
                  const step = width / (linePoints.length - 1);

                  const coords = linePoints.map((pt, i) => {
                    const x = i * step;
                    const y = height - (maxTrendPaise > 0 ? (pt.paise / maxTrendPaise) * 80 : 0) + 10;
                    return { x, y, pt };
                  });

                  const lineD = coords.reduce((acc, curr, i) => {
                    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                  }, '');

                  const areaD = `${lineD} L ${coords[coords.length - 1].x} 110 L ${coords[0].x} 110 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#trendGradient)" />
                      <path
                        d={lineD}
                        fill="none"
                        stroke="#006874"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {coords.map((c, i) => (
                        <g key={i}>
                          <circle cx={c.x} cy={c.y} r="3.5" fill="#ffffff" stroke="#006874" strokeWidth="2" />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div className="text-xs text-slate-400">Need at least 2 data points</div>
            )}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{linePoints[0]?.label || ''}</span>
            <span>{linePoints[Math.floor(linePoints.length / 2)]?.label || ''}</span>
            <span>{linePoints[linePoints.length - 1]?.label || ''}</span>
          </div>
        </div>

        {/* Monthly Expense Comparison Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Monthly Comparison
          </h3>
          <p className="text-xs text-slate-500 mb-4">Total expenditures across recent months</p>

          <div className="h-44 flex items-end gap-3 pt-4 pb-2">
            {monthlyData.map((m, idx) => {
              const heightPercent = maxMonthPaise > 0 ? (m.paise / maxMonthPaise) * 100 : 0;
              const isCurrentMonth = idx === monthlyData.length - 1;

              return (
                <div key={m.yearMonth} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md shadow-md whitespace-nowrap pointer-events-none z-10 tabular-nums">
                    {formatRupees(m.paise)}
                  </div>

                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${Math.max(heightPercent, m.paise > 0 ? 8 : 4)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isCurrentMonth ? 'bg-[#006874]' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    {m.monthName}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {formatRupees(m.paise)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
