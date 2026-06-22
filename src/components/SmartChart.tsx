import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, FunnelChart,
  Funnel, LabelList, ComposedChart, ZAxis,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';
import { prepareChartData, type ChartType } from '../lib/chartRecommendations';

const COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#8b5cf6',
  '#f97316', '#14b8a6', '#3b82f6', '#d946ef',
];

/**
 * توليد اقتراح ذكي للمستخدم بناءً على نوع المخطط والبيانات المتاحة
 */
function getSuggestionForChartType(chartType: ChartType, data: ParsedData): string {
  const numericCols = data.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = data.columns.filter((c) => c.type === 'categorical');
  const dateCols = data.columns.filter((c) => c.type === 'date');
  
  switch (chartType) {
    case 'scatter':
    case 'bubble':
      if (numericCols.length < 2) {
        return `البيانات تحتوي على عمود رقمي واحد فقط (${numericCols[0]?.name}). أضف بيانات تحتوي على عمودين رقميين على الأقل لاستخدام هذا المخطط.`;
      }
      return `اختر عمودين رقميين مختلفين لعرض العلاقة بينهما.`;
    
    case 'time-series':
      if (dateCols.length === 0) {
        return `لم يتم اكتشاف عمود تاريخ في البيانات. تأكد من وجود عمود بتنسيق تاريخ صالح مثل YYYY-MM-DD.`;
      }
      return `اختر عموداً رقمياً لعرض تطوره عبر الزمن.`;
    
    case 'histogram':
      if (numericCols.length === 0) {
        return `البيانات لا تحتوي على أعمدة رقمية. المخطط التكراري يتطلب عموداً رقمياً.`;
      }
      return `اختر عموداً رقمياً من البيانات: ${numericCols.map((c) => c.name).join('، ')}`;
    
    case 'bar':
    case 'horizontal-bar':
    case 'pie':
    case 'donut':
    case 'line':
    case 'area':
    case 'treemap':
    case 'funnel':
    case 'waterfall':
    case 'radar':
    case 'stacked-bar':
    case 'grouped-bar':
    case 'stacked-area':
    case 'composed':
      if (categoricalCols.length === 0) {
        return `البيانات لا تحتوي على أعمدة فئوية. هذه المخططات تتطلب عموداً فئوياً للتصنيف.`;
      }
      return `اختر عموداً فئوياً ورقمياً من البيانات.`;
    
    default:
      return `جرب اختيار أعمدة مختلفة أو نوع مخطط آخر.`;
  }
}

/**
 * توليد تفسير ديناميكي للمخطط حسب نوعه والبيانات
 */
function getChartInterpretation(
  chartType: ChartType,
  data: any[],
  options: { categoryColumn?: string; numericColumn?: string }
): string {
  if (!data || data.length === 0) return 'لا توجد بيانات كافية للتحليل';
  
  const { categoryColumn, numericColumn } = options;
  
  switch (chartType) {
    case 'bar':
    case 'horizontal-bar': {
      const max = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);
      const min = data.reduce((a, b) => (a.value < b.value ? a : b), data[0]);
      return `يُظهر هذا المخطط مقارنة بين ${data.length} فئة. ` +
        `أعلى قيمة هي "${max.name}" (${max.value.toLocaleString('ar-SA')}) ` +
        `وأدنى قيمة هي "${min.name}" (${min.value.toLocaleString('ar-SA')}). ` +
        `الأعمدة الأطول تعني قيماً أعلى في ${numericColumn || 'القيم'}.`;
    }
    
    case 'line': {
      const first = data[0]?.value || 0;
      const last = data[data.length - 1]?.value || 0;
      const trend = last > first ? 'تصاعدي ↑' : last < first ? 'تنازلي ↓' : 'مستقر';
      return `يُظهر هذا المخطط الاتجاه عبر ${data.length} نقطة. ` +
        `الاتجاه العام ${trend} من ${first.toLocaleString('ar-SA')} إلى ${last.toLocaleString('ar-SA')}. ` +
        `النقاط الأعلى تمثل قمم في البيانات.`;
    }
    
    case 'area': {
      const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
      return `يُظهر هذا المخطط الحجم الكلي والتغيرات. ` +
        `المجموع الكلي: ${total.toLocaleString('ar-SA')}. ` +
        `المنطقة الملونة تمثل تراكم القيم عبر ${categoryColumn || 'الفئات'}.`;
    }
    
    case 'pie':
    case 'donut': {
      const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
      const max = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);
      const maxPercent = ((max.value / total) * 100).toFixed(1);
      return `يُظهر هذا المخطط النسب المئوية لـ ${data.length} فئات. ` +
        `أكبر شريحة هي "${max.name}" بنسبة ${maxPercent}%. ` +
        `كل شريحة تمثل حصتها من المجموع الكلي (${total.toLocaleString('ar-SA')}).`;
    }
    
    case 'scatter': {
      const correlation = calculateCorrelation(data.map(d => d.x), data.map(d => d.y));
      const strength = Math.abs(correlation) > 0.7 ? 'قوية' : Math.abs(correlation) > 0.4 ? 'متوسطة' : 'ضعيفة';
      const direction = correlation > 0 ? 'طردية' : correlation < 0 ? 'عكسية' : 'غير واضحة';
      return `يُظهر هذا المخطط العلاقة بين ${data.length} نقطة. ` +
        `العلاقة ${strength} و${direction} (معامل الارتباط: ${correlation.toFixed(2)}). ` +
        `النقاط المتقاربة تشير إلى نمط مشترك.`;
    }
    
    case 'radar': {
      const max = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);
      const min = data.reduce((a, b) => (a.value < b.value ? a : b), data[0]);
      return `يُظهر هذا المخطط مقارنة متعددة الأبعاد لـ ${data.length} معايير. ` +
        `أعلى أداء في "${max.name}" (${max.value.toLocaleString('ar-SA')}) ` +
        `وأدنى أداء في "${min.name}" (${min.value.toLocaleString('ar-SA')}). ` +
        `كلما ابتعدت النقطة عن المركز، زادت القيمة.`;
    }
    
    case 'treemap': {
      const max = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);
      return `يُظهر هذا المخطط ${data.length} فئة كأحجام نسبية. ` +
        `أكبر مستطيل يمثل "${max.name}" (${max.value.toLocaleString('ar-SA')}). ` +
        `حجم كل مستطيل يتناسب مع قيمته الرقمية.`;
    }
    
    case 'funnel': {
      const first = data[0]?.value || 0;
      const last = data[data.length - 1]?.value || 0;
      const conversionRate = first > 0 ? ((last / first) * 100).toFixed(1) : 0;
      return `يُظهر هذا المخطط ${data.length} مراحل متتالية. ` +
        `يبدأ من ${first.toLocaleString('ar-SA')} وينتهي بـ ${last.toLocaleString('ar-SA')}. ` +
        `معدل التحويل الكلي: ${conversionRate}%.`;
    }
    
    case 'histogram': {
      const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
      const max = data.reduce((a, b) => (a.count > b.count ? a : b), data[0]);
      return `يُظهر هذا المخطط توزيع ${total.toLocaleString('ar-SA')} قيمة. ` +
        `أعلى تكرار في النطاق "${max.range}" (${max.count} قيمة). ` +
        `القمم تشير إلى القيم الأكثر شيوعاً.`;
    }
    
    case 'stacked-bar': {
      return `يُظهر هذا المخطط مقارنة مكدسة لـ ${data.length} فئات. ` +
        `كل عمود مقسم إلى طبقات تمثل مكونات مختلفة. ` +
        `ارتفاع العمود الكلي يمثل المجموع، وارتفاع كل طبقة يمثل مساهمتها.`;
    }
    
    case 'waterfall': {
      const positives = data.filter(d => d.value > 0).length;
      const negatives = data.filter(d => d.value < 0).length;
      return `يُظهر هذا المخطط التأثيرات التراكمية. ` +
        `الأعمدة الخضراء (${positives}) تمثل زيادة، والحمراء (${negatives}) تمثل نقصان. ` +
        `الارتفاع النهائي يمثل التأثير الكلي.`;
    }
    
    case 'time-series': {
      const first = data[0]?.value || 0;
      const last = data[data.length - 1]?.value || 0;
      const changeNum = first !== 0 ? ((last - first) / first * 100) : 0;
      const change = changeNum.toFixed(1);
      return `يُظهر هذا المخطط التطور الزمني عبر ${data.length} فترة. ` +
        `من ${first.toLocaleString('ar-SA')} إلى ${last.toLocaleString('ar-SA')} ` +
        `(${changeNum > 0 ? '+' : ''}${change}%).`;
    }
    
    default:
      return `يُظهر هذا المخطط ${data.length} نقطة بيانات. ` +
        `استخدم المؤشر على العناصر لرؤية القيم التفصيلية.`;
  }
}

/**
 * حساب معامل الارتباط (Pearson)
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

interface SmartChartProps {
  data: ParsedData;
  chartType: ChartType;
  title?: string;
  subtitle?: string;
  // Old props (backward compatibility)
  categoryColumn?: string;
  numericColumn?: string;
  secondNumericColumn?: string;
  // New flexible axis system
  axisSelections?: Record<string, string>;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  topN?: number;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function SmartChart({
  data,
  chartType,
  title,
  subtitle,
  categoryColumn,
  numericColumn,
  secondNumericColumn,
  axisSelections,
  aggregation = 'sum',
  topN = 10,
  height = 350,
  showLegend = true,
  showGrid = true,
}: SmartChartProps) {
  // Normalize axis selections - support both old and new API
  const normalizedAxes: Record<string, string> = axisSelections ? {
    ...axisSelections,
  } : {
    ...(categoryColumn ? { category: categoryColumn } : {}),
    ...(numericColumn ? { value: numericColumn, x: numericColumn } : {}),
    ...(secondNumericColumn ? { y: secondNumericColumn } : {}),
  };
  const { data: chartData, config, error } = useMemo(
    () =>
      prepareChartData(data, chartType, {
        categoryColumn: normalizedAxes.category || categoryColumn,
        numericColumn: normalizedAxes.value || numericColumn,
        secondNumericColumn: normalizedAxes.y || secondNumericColumn,
        axisSelections: normalizedAxes,
        aggregation,
        topN,
      }),
    [data, chartType, normalizedAxes, categoryColumn, numericColumn, secondNumericColumn, aggregation, topN]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <strong className="text-base">تعذر عرض المخطط</strong>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            {error || 'لا توجد بيانات كافية لعرض هذا المخطط.'}
          </p>
          
          {/* Show selected axes */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <strong className="block mb-2 text-amber-900">🔍 المحاور المختارة:</strong>
            <div className="space-y-1 text-xs">
              {Object.entries(normalizedAxes).filter(([_, v]) => v).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-semibold text-amber-700">{key}:</span>
                  <span className="text-amber-900">{value}</span>
                  {data.columns.find(c => c.name === value) && (
                    <span className="text-emerald-600">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Show available columns */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <strong className="block mb-2 text-amber-900">📊 الأعمدة المتاحة:</strong>
            <div className="text-xs text-amber-700 space-y-1">
              <div><strong>رقمية:</strong> {data.columns.filter(c => c.type === 'numeric').map(c => c.name).join(', ') || 'لا يوجد'}</div>
              <div><strong>فئوية:</strong> {data.columns.filter(c => c.type === 'categorical').map(c => c.name).join(', ') || 'لا يوجد'}</div>
              <div><strong>تاريخ:</strong> {data.columns.filter(c => c.type === 'date').map(c => c.name).join(', ') || 'لا يوجد'}</div>
              <div><strong>نصية:</strong> {data.columns.filter(c => c.type === 'text').map(c => c.name).join(', ') || 'لا يوجد'}</div>
            </div>
          </div>
          
          {/* Suggestion */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <strong className="block mb-1 text-amber-900">💡 اقتراح:</strong>
            <p className="text-xs text-amber-700">
              {getSuggestionForChartType(chartType, data)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const commonTooltip = (
    <Tooltip
      contentStyle={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        fontSize: '12px',
      }}
      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
    />
  );

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <Bar
              dataKey={config.valueKey}
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        );

      case 'horizontal-bar':
        return (
          <BarChart data={chartData} layout="vertical">
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey={config.categoryKey}
              tick={{ fontSize: 11, fill: '#64748b' }}
              width={100}
            />
            {commonTooltip}
            {showLegend && <Legend />}
            <Bar
              dataKey={config.valueKey}
              fill="#8b5cf6"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={config.valueKey}
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={config.valueKey}
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#areaGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            {commonTooltip}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              dataKey={config.valueKey}
              nameKey={config.categoryKey}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={true}
              animationDuration={800}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'donut':
        return (
          <PieChart>
            {commonTooltip}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={height / 5}
              outerRadius={height / 3}
              paddingAngle={3}
              dataKey={config.valueKey}
              nameKey={config.categoryKey}
              animationDuration={800}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis
              type="number"
              dataKey={config.xKey}
              name={numericColumn || 'X'}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey={config.yKey}
              name={secondNumericColumn || 'Y'}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            {commonTooltip}
            <Scatter
              data={chartData}
              fill="#ec4899"
              fillOpacity={0.7}
              animationDuration={800}
            />
          </ScatterChart>
        );

      case 'bubble':
        return (
          <ScatterChart>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis
              type="number"
              dataKey={config.xKey}
              name="X"
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey={config.yKey}
              name="Y"
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <ZAxis type="number" dataKey={config.zKey} range={[50, 400]} />
            {commonTooltip}
            <Scatter
              data={chartData}
              fill="#8b5cf6"
              fillOpacity={0.6}
              animationDuration={800}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case 'histogram':
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            <Bar
              dataKey={config.valueKey}
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        );

      case 'radar':
        return (
          <RadarChart data={chartData} outerRadius={height / 3}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey={config.subjectKey}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
            {commonTooltip}
            <Radar
              dataKey={config.valueKey}
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.4}
              animationDuration={800}
            />
          </RadarChart>
        );

      case 'treemap':
        return (
          <Treemap
            data={chartData}
            dataKey={config.valueKey}
            nameKey={config.categoryKey}
            stroke="#fff"
            fill="#6366f1"
            animationDuration={800}
            content={<CustomTreemapContent />}
          />
        );

      case 'funnel':
        return (
          <FunnelChart>
            {commonTooltip}
            <Funnel
              dataKey={config.valueKey}
              data={chartData}
              isAnimationActive
              animationDuration={800}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList
                position="center"
                fill="#fff"
                stroke="none"
                dataKey={config.categoryKey}
                fontSize={12}
              />
            </Funnel>
          </FunnelChart>
        );

      case 'waterfall':
        return (
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            <Bar
              dataKey={config.valueKey}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={(entry as any).value >= 0 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </ComposedChart>
        );

      case 'stacked-bar':
        const stackedKeys = Object.keys(chartData[0] || {}).filter((k) => k !== 'name');
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            {stackedKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={COLORS[i % COLORS.length]}
                animationDuration={800}
              />
            ))}
          </BarChart>
        );

      case 'grouped-bar':
        const groupedKeys = Object.keys(chartData[0] || {}).filter((k) => k !== 'name');
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            {groupedKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            ))}
          </BarChart>
        );

      case 'stacked-area':
        const areaKeys = Object.keys(chartData[0] || {}).filter((k) => k !== 'name');
        return (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            {areaKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="stack"
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.7}
                animationDuration={800}
              />
            ))}
          </AreaChart>
        );

      case 'time-series':
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.dateKey} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={config.valueKey}
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 3 }}
              animationDuration={1000}
            />
          </LineChart>
        );

      case 'composed':
        return (
          <ComposedChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis dataKey={config.categoryKey || 'name'} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            {commonTooltip}
            {showLegend && <Legend />}
            <Bar
              dataKey={config.valueKey || 'value'}
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey={config.valueKey || 'value'}
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 4 }}
              animationDuration={1000}
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      {title && (
        <div className="mb-3">
          <h5 className="font-bold text-slate-900">{title}</h5>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() as any}
      </ResponsiveContainer>
      
      {/* Chart Interpretation */}
      <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">تفسير المخطط:</strong>{' '}
            {getChartInterpretation(chartType, chartData, { categoryColumn, numericColumn })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Custom Treemap Content for better labels
function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, value } = props;
  
  // Don't render if too small
  if (width < 40 || height < 30) return <rect x={x} y={y} width={width} height={height} fill={COLORS[Math.floor(Math.random() * COLORS.length)]} stroke="#fff" />;
  
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={COLORS[Math.floor(Math.random() * COLORS.length)]} stroke="#fff" strokeWidth={2} />
      <text
        x={x + width / 2}
        y={y + height / 2 - 5}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="#fff"
        fontSize={10}
        opacity={0.9}
      >
        {value?.toLocaleString('ar-SA')}
      </text>
    </g>
  );
}
