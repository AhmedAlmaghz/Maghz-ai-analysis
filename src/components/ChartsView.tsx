import { useState, useMemo } from 'react';
import { BarChart3, Info, Wand2, AlertTriangle, Check } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';
import { SmartChart } from './SmartChart';
import { recommendCharts, CHART_METADATA, type ChartType } from '../lib/chartRecommendations';
import { CHART_AXIS_CONFIGS, isColumnCompatible, getColumnWarning } from '../lib/chartAxisConfig';

interface Props {
  data: ParsedData;
}

type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export function ChartsView({ data }: Props) {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [axisSelections, setAxisSelections] = useState<Record<string, string>>({});
  const [aggregation, setAggregation] = useState<AggregationType>('sum');

  // Get axis configuration for current chart type
  const axisConfig = CHART_AXIS_CONFIGS[selectedChartType];

  // Initialize axis selections when chart type changes
  useMemo(() => {
    const newSelections: Record<string, string> = {};
    
    axisConfig.axes.forEach((axis) => {
      // Try to find a column that matches the preferred type
      const preferredCol = data.columns.find((c) => c.type === axis.preferredType);
      const compatibleCol = data.columns.find((c) => isColumnCompatible(c.type, axis));
      
      if (preferredCol) {
        newSelections[axis.id] = preferredCol.name;
      } else if (compatibleCol && !axis.allowEmpty) {
        newSelections[axis.id] = compatibleCol.name;
      }
    });
    
    setAxisSelections(newSelections);
  }, [selectedChartType, data.columns, axisConfig.axes]);

  // Get recommendations
  const recommendations = useMemo(() => recommendCharts(data), [data]);

  // Validate axis selections
  const validation = useMemo(() => {
    const warnings: { axis: string; message: string }[] = [];
    const errors: { axis: string; message: string }[] = [];
    
    axisConfig.axes.forEach((axis) => {
      const selectedCol = axisSelections[axis.id];
      
      if (axis.required && !selectedCol) {
        errors.push({
          axis: axis.id,
          message: `${axis.labelAr} مطلوب`,
        });
        return;
      }
      
      if (selectedCol) {
        const col = data.columns.find((c) => c.name === selectedCol);
        if (col) {
          const warning = getColumnWarning(col.type, axis);
          if (warning) {
            warnings.push({
              axis: axis.id,
              message: warning,
            });
          }
        }
      }
    });
    
    return { warnings, errors, isValid: errors.length === 0 };
  }, [axisConfig, axisSelections, data.columns]);

  // Handle axis selection change
  const handleAxisChange = (axisId: string, columnName: string) => {
    setAxisSelections((prev) => ({
      ...prev,
      [axisId]: columnName,
    }));
  };

  // Get column type icon
  const getColumnTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric': return '🔢';
      case 'categorical': return '🏷️';
      case 'date': return '📅';
      case 'text': return '📝';
      default: return '📊';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* Chart Type Selector */}
        <div className="glass rounded-2xl border border-white/20 p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">نوع المخطط</h3>
              <p className="text-xs text-slate-500">{CHART_METADATA[selectedChartType].description}</p>
            </div>
          </div>

          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as ChartType)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          >
            <optgroup label="📊 الأساسية">
              {(['bar', 'horizontal-bar', 'line', 'area', 'pie', 'donut'] as ChartType[]).map((t) => (
                <option key={t} value={t}>
                  {CHART_METADATA[t].icon} {CHART_METADATA[t].label}
                </option>
              ))}
            </optgroup>
            <optgroup label="📈 الإحصائية">
              {(['scatter', 'bubble', 'histogram'] as ChartType[]).map((t) => (
                <option key={t} value={t}>
                  {CHART_METADATA[t].icon} {CHART_METADATA[t].label}
                </option>
              ))}
            </optgroup>
            <optgroup label="🎨 المتقدمة">
              {(['radar', 'treemap', 'funnel', 'waterfall', 'stacked-bar', 'grouped-bar'] as ChartType[]).map((t) => (
                <option key={t} value={t}>
                  {CHART_METADATA[t].icon} {CHART_METADATA[t].label}
                </option>
              ))}
            </optgroup>
            <optgroup label="⏱️ الزمنية">
              <option value="time-series">⏱️ سلسلة زمنية</option>
            </optgroup>
          </select>

          {/* Quick Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">مقترح:</span>
              {recommendations.slice(0, 3).map((rec) => (
                <button
                  key={rec.type}
                  onClick={() => setSelectedChartType(rec.type)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedChartType === rec.type
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span>{CHART_METADATA[rec.type].icon}</span>
                  <span>{CHART_METADATA[rec.type].label}</span>
                  <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {Math.round(rec.confidence * 100)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Axis Configuration */}
        <div className="glass rounded-2xl border border-white/20 p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">تخصيص المحاور</h3>
              <p className="text-xs text-slate-500">اختر الأعمدة لكل محور بحرية</p>
            </div>
          </div>

          <div className="space-y-4">
            {axisConfig.axes.map((axis) => {
              const selectedCol = axisSelections[axis.id];
              const selectedColInfo = data.columns.find((c) => c.name === selectedCol);
              const warning = selectedColInfo ? getColumnWarning(selectedColInfo.type, axis) : null;
              const error = validation.errors.find((e) => e.axis === axis.id);

              return (
                <div key={axis.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {axis.labelAr}
                    {axis.required && <span className="text-red-500 mr-1">*</span>}
                    {!axis.required && <span className="text-slate-400 text-xs mr-2">(اختياري)</span>}
                  </label>
                  
                  <select
                    value={selectedCol || ''}
                    onChange={(e) => handleAxisChange(axis.id, e.target.value)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      error
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                        : warning
                        ? 'border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-500/20'
                        : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="">اختر عموداً...</option>
                    
                    {/* Group columns by type */}
                    {['numeric', 'categorical', 'date', 'text'].map((type) => {
                      const cols = data.columns.filter((c) => c.type === type);
                      if (cols.length === 0) return null;
                      
                      return (
                        <optgroup key={type} label={`${getColumnTypeIcon(type)} ${type === 'numeric' ? 'أعمدة رقمية' : type === 'categorical' ? 'أعمدة فئوية' : type === 'date' ? 'أعمدة تاريخية' : 'أعمدة نصية'}`}>
                          {cols.map((col) => {
                            const compatible = isColumnCompatible(col.type, axis);
                            return (
                              <option key={col.name} value={col.name} disabled={!compatible}>
                                {col.name} ({col.uniqueCount} قيمة) {!compatible && '⚠️'}
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </select>

                  {/* Axis Description */}
                  <p className="text-xs text-slate-500">{axis.description}</p>

                  {/* Warnings and Errors */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{error.message}</p>
                    </div>
                  )}
                  
                  {warning && !error && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2">
                      <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{warning}</p>
                    </div>
                  )}

                  {/* Success indicator */}
                  {selectedCol && !warning && !error && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Check className="h-3 w-3" />
                      <span>متوافق</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Aggregation (if applicable) */}
            {axisConfig.axes.some((a) => a.id === 'value' || a.id === 'barValue' || a.id === 'lineValue') && (
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700">
                  طريقة التجميع
                </label>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as AggregationType)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="sum">➕ المجموع</option>
                  <option value="avg">📊 المتوسط</option>
                  <option value="count">🔢 العدد</option>
                  <option value="min">⬇️ الأدنى</option>
                  <option value="max">⬆️ الأعلى</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Display */}
      <div className="lg:col-span-2">
        <div className="glass rounded-2xl border border-white/20 p-6 shadow-xl h-full flex flex-col justify-between">
          {validation.isValid ? (
            <SmartChart
              data={data}
              chartType={selectedChartType}
              axisSelections={axisSelections}
              aggregation={aggregation}
              height={450}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center my-auto">
              <AlertTriangle className="h-16 w-16 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                المحاور غير مكتملة
              </h3>
              <p className="text-sm text-slate-600 max-w-md">
                الرجاء إكمال جميع المحاور المطلوبة لعرض المخطط
              </p>
              <div className="mt-4 space-y-1">
                {validation.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">
                    • {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
