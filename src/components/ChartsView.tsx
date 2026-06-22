import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';
import {
  getTopCategories,
  getNumericByCategory,
  buildTimeSeries,
  linearForecast,
} from '../lib/dataParser';

interface Props {
  data: ParsedData;
}

const COLORS = [
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
];

export function ChartsView({ data }: Props) {
  const numericCols = data.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = data.columns.filter((c) => c.type === 'categorical');
  const dateCols = data.columns.filter((c) => c.type === 'date');
  
  const [selectedNum, setSelectedNum] = useState(numericCols[0]?.name || '');
  const [selectedCat, setSelectedCat] = useState(categoricalCols[0]?.name || '');
  
  const topCategories = useMemo(() => {
    if (!selectedCat) return [];
    return getTopCategories(data, selectedCat);
  }, [data, selectedCat]);
  
  const numericByCategory = useMemo(() => {
    if (!selectedCat || !selectedNum) return [];
    return getNumericByCategory(data, selectedCat, selectedNum, 'sum');
  }, [data, selectedCat, selectedNum]);
  
  const timeSeries = useMemo(() => {
    if (!selectedNum || dateCols.length === 0) return [];
    return buildTimeSeries(data, selectedNum);
  }, [data, selectedNum, dateCols]);
  
  const forecastData = useMemo(() => {
    if (timeSeries.length < 3) return [];
    const values = timeSeries.map((d) => d.value);
    const forecast = linearForecast(values, 3);
    return [
      ...timeSeries.map((d) => ({ name: d.name, actual: d.value, forecast: null as number | null })),
      ...forecast.map((v, i) => ({
        name: `+${i + 1}`,
        actual: null as number | null,
        forecast: v,
      })),
    ];
  }, [timeSeries]);
  
  if (data.rows.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass rounded-2xl border border-white/20 p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">التصورات البيانية</h3>
            <p className="text-sm text-slate-500">اختر الأعمدة لتوليد الرسوم</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              العمود الرقمي
            </label>
            <select
              value={selectedNum}
              onChange={(e) => setSelectedNum(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              العمود الفئوي
            </label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {categoricalCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Top Categories */}
        {topCategories.length > 0 && (
          <ChartCard
            title={`توزيع ${selectedCat}`}
            subtitle={`أعلى ${topCategories.length} قيم`}
            icon={<PieIcon className="h-5 w-5" />}
            iconColor="from-purple-500 to-indigo-600"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCategories}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        
        {/* Pie Chart: Distribution */}
        {topCategories.length > 0 && (
          <ChartCard
            title={`النسب المئوية - ${selectedCat}`}
            subtitle="توزيع القيم"
            icon={<PieIcon className="h-5 w-5" />}
            iconColor="from-pink-500 to-rose-600"
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        
        {/* Bar: Numeric by Category */}
        {numericByCategory.length > 0 && (
          <ChartCard
            title={`${selectedNum} حسب ${selectedCat}`}
            subtitle="إجمالي القيم"
            icon={<BarChart3 className="h-5 w-5" />}
            iconColor="from-emerald-500 to-teal-600"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={numericByCategory}>
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        
        {/* Time Series with Forecast */}
        {timeSeries.length > 2 && (
          <ChartCard
            title={`الاتجاه الزمني - ${selectedNum}`}
            subtitle={forecastData.length > timeSeries.length ? 'مع التنبؤ المستقبلي' : 'عبر الزمن'}
            icon={<TrendingUp className="h-5 w-5" />}
            iconColor="from-amber-500 to-orange-600"
            wide
          >
            <ResponsiveContainer width="100%" height={300}>
              {forecastData.length > timeSeries.length ? (
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="فعلي"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="تنبؤ"
                    stroke="#ec4899"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#ec4899', r: 4 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon,
  iconColor,
  children,
  wide,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl border border-white/20 p-5 shadow-xl ${wide ? 'lg:col-span-2' : ''}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${iconColor} shadow-lg text-white`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
