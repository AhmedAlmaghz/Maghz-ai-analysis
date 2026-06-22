import { useMemo } from 'react';
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
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';
import { getTopCategories, getNumericByCategory } from '../lib/dataParser';
import type { ChatVisualization } from '../lib/chat';

interface Props {
  data: ParsedData;
  visualization: ChatVisualization;
}

const COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#8b5cf6',
  '#f97316', '#14b8a6',
];

export function ChatChart({ data, visualization }: Props) {
  const chartData = useMemo(() => {
    const { type, categoryColumn, numericColumn, aggregation, topN } = visualization;

    // Pie or Bar without numeric column: category distribution
    if ((type === 'pie' || (type === 'bar' && !numericColumn)) && categoryColumn) {
      return getTopCategories(data, categoryColumn, topN || 10);
    }

    // Bar/Line/Area with both columns
    if (categoryColumn && numericColumn) {
      return getNumericByCategory(
        data,
        categoryColumn,
        numericColumn,
        aggregation === 'avg' ? 'avg' : 'sum'
      );
    }

    // Numeric only: distribution by category fallback
    if (numericColumn) {
      const catCol = data.columns.find((c) => c.type === 'categorical');
      if (catCol) {
        return getNumericByCategory(data, catCol.name, numericColumn, aggregation === 'avg' ? 'avg' : 'sum');
      }
    }

    return [];
  }, [data, visualization]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>تعذر توليد هذا التصور. الأعمدة قد لا تكون متاحة.</span>
      </div>
    );
  }

  const isNumericByCategory = Boolean(visualization.numericColumn);
  const label = isNumericByCategory
    ? `${visualization.aggregation === 'avg' ? 'متوسط' : 'إجمالي'} ${visualization.numericColumn}`
    : 'العدد';

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      {visualization.title && (
        <div className="mb-3">
          <h5 className="font-bold text-slate-900">{visualization.title}</h5>
          {visualization.subtitle && (
            <p className="text-xs text-slate-500">{visualization.subtitle}</p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={260}>
        {visualization.type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}
            />
            <Legend />
          </PieChart>
        ) : visualization.type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={label}
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 4 }}
            />
          </LineChart>
        ) : visualization.type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="chatAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={label}
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#chatAreaGrad)"
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="chatBarGrad" x1="0" y1="0" x2="0" y2="1">
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
                borderRadius: '10px',
              }}
            />
            <Bar dataKey="value" name={label} fill="url(#chatBarGrad)" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
