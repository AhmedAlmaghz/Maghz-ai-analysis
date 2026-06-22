import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';
import type { ChatVisualization } from '../lib/chat';
import { SmartChart } from './SmartChart';
import { recommendCharts, selectBestChartForQuestion, type ChartType } from '../lib/chartRecommendations';

interface Props {
  data: ParsedData;
  visualization: ChatVisualization;
}

export function ChatChart({ data, visualization }: Props) {
  const chartType = useMemo<ChartType>(() => {
    // Use the type from visualization if valid
    if (visualization.type && isValidChartType(visualization.type)) {
      return visualization.type as ChartType;
    }
    
    // Auto-detect best chart type based on columns
    const bestType = selectBestChartForQuestion(
      visualization.title || '',
      data
    );
    
    if (bestType) return bestType;
    
    // Fallback: use recommendations
    const recs = recommendCharts(data, visualization.title);
    return recs[0]?.type || 'bar';
  }, [data, visualization]);
  
  const hasRequiredColumns = useMemo(() => {
    const { categoryColumn, numericColumn } = visualization;
    return categoryColumn || numericColumn;
  }, [visualization]);
  
  if (!hasRequiredColumns) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>تعذر توليد هذا التصور. الأعمدة قد لا تكون متاحة.</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <SmartChart
        data={data}
        chartType={chartType}
        title={visualization.title}
        subtitle={visualization.subtitle}
        categoryColumn={visualization.categoryColumn}
        numericColumn={visualization.numericColumn}
        secondNumericColumn={undefined}
        aggregation={visualization.aggregation}
        topN={visualization.topN}
        height={300}
      />
    </div>
  );
}

function isValidChartType(type: string): boolean {
  const validTypes: ChartType[] = [
    'bar', 'horizontal-bar', 'line', 'area', 'pie', 'donut',
    'scatter', 'bubble', 'histogram', 'radar', 'treemap',
    'funnel', 'waterfall', 'stacked-bar', 'stacked-area',
    'grouped-bar', 'composed', 'time-series',
  ];
  return validTypes.includes(type as ChartType);
}
