import type { ParsedData } from './dataParser';

export type ChartType =
  // Basic
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  // Statistical
  | 'scatter'
  | 'bubble'
  | 'histogram'
  // Advanced
  | 'radar'
  | 'treemap'
  | 'funnel'
  | 'waterfall'
  | 'stacked-bar'
  | 'stacked-area'
  | 'grouped-bar'
  | 'composed'
  // Time series
  | 'time-series';

export interface ChartRecommendation {
  type: ChartType;
  confidence: number; // 0-1
  reason: string;
  requires: {
    categoryColumn?: string;
    numericColumn?: string;
    secondNumericColumn?: string;
    dateColumn?: string;
  };
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ChartMetadata {
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  bestFor: string[];
  minCategories: number;
  maxCategories: number;
  requiresNumeric: number;
  requiresCategorical: number;
  requiresDate: boolean;
}

export const CHART_METADATA: Record<ChartType, ChartMetadata> = {
  'bar': {
    label: 'أعمدة',
    labelEn: 'Bar',
    icon: '📊',
    description: 'مقارنة القيم بين الفئات',
    bestFor: ['مقارنة', 'تصنيف', 'ترتيب'],
    minCategories: 2,
    maxCategories: 15,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'horizontal-bar': {
    label: 'أعمدة أفقية',
    labelEn: 'Horizontal Bar',
    icon: '📊',
    description: 'مقارنة القيم مع أسماء فئات طويلة',
    bestFor: ['ترتيب', 'تصنيف', 'أسماء طويلة'],
    minCategories: 2,
    maxCategories: 15,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'line': {
    label: 'خطي',
    labelEn: 'Line',
    icon: '📈',
    description: 'عرض الاتجاهات عبر الزمن أو الفئات',
    bestFor: ['اتجاهات', 'زمن', 'تطور'],
    minCategories: 3,
    maxCategories: 100,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'area': {
    label: 'مساحة',
    labelEn: 'Area',
    icon: '📉',
    description: 'عرض الحجم الكلي والتغيرات',
    bestFor: ['حجم', 'تراكم', 'زمن'],
    minCategories: 3,
    maxCategories: 100,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'pie': {
    label: 'دائري',
    labelEn: 'Pie',
    icon: '🥧',
    description: 'النسب المئوية لفئات قليلة',
    bestFor: ['نسب', 'توزيع', 'حصص'],
    minCategories: 2,
    maxCategories: 7,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'donut': {
    label: 'حلقي',
    labelEn: 'Donut',
    icon: '🍩',
    description: 'بديل عصري للمخطط الدائري',
    bestFor: ['نسب', 'توزيع', 'مجموع'],
    minCategories: 2,
    maxCategories: 7,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'scatter': {
    label: 'نقاط مبعثرة',
    labelEn: 'Scatter',
    icon: '🔵',
    description: 'إظهار العلاقة بين متغيرين',
    bestFor: ['علاقة', 'ارتباط', 'توزيع'],
    minCategories: 10,
    maxCategories: 1000,
    requiresNumeric: 2,
    requiresCategorical: 0,
    requiresDate: false,
  },
  'bubble': {
    label: 'فقاعات',
    labelEn: 'Bubble',
    icon: '🫧',
    description: '3 أبعاد من البيانات',
    bestFor: ['3 أبعاد', 'مقارنة مركبة'],
    minCategories: 5,
    maxCategories: 100,
    requiresNumeric: 3,
    requiresCategorical: 0,
    requiresDate: false,
  },
  'histogram': {
    label: 'تكراري',
    labelEn: 'Histogram',
    icon: '📊',
    description: 'توزيع القيم الرقمية',
    bestFor: ['توزيع', 'تكرار', 'نطاق'],
    minCategories: 10,
    maxCategories: 10000,
    requiresNumeric: 1,
    requiresCategorical: 0,
    requiresDate: false,
  },
  'radar': {
    label: 'عنكبوتي',
    labelEn: 'Radar',
    icon: '🕸️',
    description: 'مقارنة متعددة الأبعاد',
    bestFor: ['مقارنة', 'أبعاد متعددة', 'أداء'],
    minCategories: 3,
    maxCategories: 8,
    requiresNumeric: 3,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'treemap': {
    label: 'شجري',
    labelEn: 'Treemap',
    icon: '🌳',
    description: 'عرض البيانات الهرمية',
    bestFor: ['هرمية', 'أحجام', 'فروع'],
    minCategories: 3,
    maxCategories: 50,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'funnel': {
    label: 'قمعي',
    labelEn: 'Funnel',
    icon: '🔽',
    description: 'مراحل العملية والتحويل',
    bestFor: ['مراحل', 'تحويل', 'تناقص'],
    minCategories: 3,
    maxCategories: 10,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'waterfall': {
    label: 'شلال',
    labelEn: 'Waterfall',
    icon: '💧',
    description: 'عرض التأثيرات التراكمية',
    bestFor: ['تأثيرات', 'ربح/خسارة', 'تراكم'],
    minCategories: 3,
    maxCategories: 15,
    requiresNumeric: 1,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'stacked-bar': {
    label: 'أعمدة مكدسة',
    labelEn: 'Stacked Bar',
    icon: '📚',
    description: 'مقارنة التركيب الداخلي',
    bestFor: ['تركيب', 'مجموع', 'مقارنة'],
    minCategories: 2,
    maxCategories: 10,
    requiresNumeric: 2,
    requiresCategorical: 2,
    requiresDate: false,
  },
  'stacked-area': {
    label: 'مساحة مكدسة',
    labelEn: 'Stacked Area',
    icon: '📊',
    description: 'التراكم عبر الزمن',
    bestFor: ['تراكم', 'زمن', 'تركيب'],
    minCategories: 3,
    maxCategories: 50,
    requiresNumeric: 2,
    requiresCategorical: 1,
    requiresDate: true,
  },
  'grouped-bar': {
    label: 'أعمدة مجمعة',
    labelEn: 'Grouped Bar',
    icon: '📊',
    description: 'مقارنة مجموعات متعددة',
    bestFor: ['مقارنة', 'مجموعات', 'فئات'],
    minCategories: 2,
    maxCategories: 10,
    requiresNumeric: 2,
    requiresCategorical: 2,
    requiresDate: false,
  },
  'composed': {
    label: 'مركب',
    labelEn: 'Composed',
    icon: '🎨',
    description: 'مخطط يجمع بين أنواع مختلفة',
    bestFor: ['متعدد', 'مقارنة', 'تحليل'],
    minCategories: 3,
    maxCategories: 50,
    requiresNumeric: 2,
    requiresCategorical: 1,
    requiresDate: false,
  },
  'time-series': {
    label: 'سلسلة زمنية',
    labelEn: 'Time Series',
    icon: '⏱️',
    description: 'البيانات المرتبطة بالزمن',
    bestFor: ['زمن', 'اتجاهات', 'تاريخ'],
    minCategories: 5,
    maxCategories: 1000,
    requiresNumeric: 1,
    requiresCategorical: 0,
    requiresDate: true,
  },
};

/**
 * نظام التوصية الذكي بالمخططات
 * يحلل البيانات ويختار أفضل أنواع المخططات
 */
export function recommendCharts(
  data: ParsedData,
  userIntent?: string
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];
  
  const numericCols = data.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = data.columns.filter((c) => c.type === 'categorical');
  const dateCols = data.columns.filter((c) => c.type === 'date');
  
  const hasDate = dateCols.length > 0;
  const hasNumeric = numericCols.length > 0;
  const hasCategorical = categoricalCols.length > 0;
  
  // Analyze user intent keywords
  const intentArabic = userIntent || '';
  
  const intentKeywords = {
    trend: ['اتجاه', 'trend', 'تطور', 'عبر الزمن', 'زمني'],
    comparison: ['قارن', 'مقارنة', 'compare', 'فرق', 'بين'],
    distribution: ['توزيع', 'distribution', 'نسب', 'حصص', 'نسبة'],
    correlation: ['علاقة', 'ارتباط', 'correlation', 'ترابط'],
    ranking: ['ترتيب', 'ranking', 'أفضل', 'أسوأ', 'top', 'أساسي'],
    composition: ['تركيب', 'composition', 'مكونات', 'تكوين'],
    total: ['إجمالي', 'total', 'مجموع', 'كل'],
    average: ['متوسط', 'average', 'mean', 'معدل'],
  };
  
  const detectedIntents = {
    trend: intentKeywords.trend.some((k) => intentArabic.includes(k)),
    comparison: intentKeywords.comparison.some((k) => intentArabic.includes(k)),
    distribution: intentKeywords.distribution.some((k) => intentArabic.includes(k)),
    correlation: intentKeywords.correlation.some((k) => intentArabic.includes(k)),
    ranking: intentKeywords.ranking.some((k) => intentArabic.includes(k)),
    composition: intentKeywords.composition.some((k) => intentArabic.includes(k)),
  };
  
  // 1. Time Series (if date column exists)
  if (hasDate && hasNumeric) {
    recommendations.push({
      type: 'time-series',
      confidence: detectedIntents.trend ? 0.95 : 0.8,
      reason: 'توجد بيانات تاريخية - مثالي لعرض الاتجاهات الزمنية',
      requires: {
        dateColumn: dateCols[0].name,
        numericColumn: numericCols[0].name,
      },
    });
  }
  
  // 2. Pie/Donut (for distribution of categorical data)
  if (hasCategorical && hasNumeric) {
    const topCat = categoricalCols[0];
    if (topCat.uniqueCount >= 2 && topCat.uniqueCount <= 7) {
      recommendations.push({
        type: detectedIntents.distribution ? 'donut' : 'pie',
        confidence: detectedIntents.distribution ? 0.9 : 0.75,
        reason: `توزيع ${topCat.uniqueCount} فئات - مثالي للنسب المئوية`,
        requires: {
          categoryColumn: topCat.name,
          numericColumn: numericCols[0].name,
        },
        aggregation: 'sum',
      });
    }
  }
  
  // 3. Bar Chart (for ranking/comparison)
  if (hasCategorical && hasNumeric) {
    const catCol = categoricalCols[0];
    const chartType: ChartType = catCol.uniqueCount > 8 ? 'horizontal-bar' : 'bar';
    recommendations.push({
      type: chartType,
      confidence: detectedIntents.comparison || detectedIntents.ranking ? 0.9 : 0.8,
      reason: `مقارنة ${catCol.uniqueCount} فئة بالقيم الرقمية`,
      requires: {
        categoryColumn: catCol.name,
        numericColumn: numericCols[0].name,
      },
      aggregation: 'sum',
    });
  }
  
  // 4. Line/Area Chart (for trends)
  if (hasCategorical && hasNumeric && categoricalCols[0].uniqueCount >= 3) {
    recommendations.push({
      type: 'line',
      confidence: detectedIntents.trend ? 0.9 : 0.6,
      reason: 'عرض الاتجاه والتغير عبر الفئات',
      requires: {
        categoryColumn: categoricalCols[0].name,
        numericColumn: numericCols[0].name,
      },
      aggregation: 'avg',
    });
    
    recommendations.push({
      type: 'area',
      confidence: detectedIntents.trend ? 0.85 : 0.5,
      reason: 'عرض الحجم والتراكم',
      requires: {
        categoryColumn: categoricalCols[0].name,
        numericColumn: numericCols[0].name,
      },
      aggregation: 'sum',
    });
  }
  
  // 5. Scatter Plot (for correlation between 2 numeric columns)
  if (numericCols.length >= 2 && data.rows.length >= 10) {
    recommendations.push({
      type: 'scatter',
      confidence: detectedIntents.correlation ? 0.9 : 0.6,
      reason: `إظهار العلاقة بين ${numericCols[0].name} و ${numericCols[1].name}`,
      requires: {
        numericColumn: numericCols[0].name,
        secondNumericColumn: numericCols[1].name,
      },
    });
  }
  
  // 6. Histogram (for single numeric distribution)
  if (hasNumeric && data.rows.length >= 10) {
    recommendations.push({
      type: 'histogram',
      confidence: detectedIntents.distribution ? 0.85 : 0.5,
      reason: `توزيع قيم ${numericCols[0].name}`,
      requires: {
        numericColumn: numericCols[0].name,
      },
    });
  }
  
  // 7. Radar (for multi-metric comparison)
  if (numericCols.length >= 3 && hasCategorical) {
    const catCol = categoricalCols[0];
    if (catCol.uniqueCount >= 3 && catCol.uniqueCount <= 8) {
      recommendations.push({
        type: 'radar',
        confidence: detectedIntents.comparison ? 0.7 : 0.4,
        reason: `مقارنة ${catCol.uniqueCount} فئات عبر ${numericCols.length} مقاييس`,
        requires: {
          categoryColumn: catCol.name,
          numericColumn: numericCols[0].name,
        },
      });
    }
  }
  
  // 8. Treemap (for hierarchical/composition data)
  if (hasCategorical && hasNumeric) {
    const catCol = categoricalCols[0];
    if (catCol.uniqueCount >= 5 && catCol.uniqueCount <= 50) {
      recommendations.push({
        type: 'treemap',
        confidence: detectedIntents.composition ? 0.8 : 0.4,
        reason: `عرض ${catCol.uniqueCount} فئة كأحجام نسبية`,
        requires: {
          categoryColumn: catCol.name,
          numericColumn: numericCols[0].name,
        },
      });
    }
  }
  
  // 9. Funnel (if data shows decreasing trend)
  if (hasCategorical && hasNumeric) {
    recommendations.push({
      type: 'funnel',
      confidence: 0.3,
      reason: 'عرض المراحل أو التحويل',
      requires: {
        categoryColumn: categoricalCols[0].name,
        numericColumn: numericCols[0].name,
      },
    });
  }
  
  // 10. Stacked Bar (for 2 categorical + numeric)
  if (categoricalCols.length >= 2 && hasNumeric) {
    recommendations.push({
      type: 'stacked-bar',
      confidence: detectedIntents.composition ? 0.75 : 0.5,
      reason: `مقارنة التكوين الداخلي بين ${categoricalCols[0].name} و ${categoricalCols[1].name}`,
      requires: {
        categoryColumn: categoricalCols[0].name,
        numericColumn: numericCols[0].name,
      },
    });
  }
  
  // Sort by confidence and return top recommendations
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}

/**
 * تحديد أفضل مخطط بناءً على سؤال المستخدم
 */
export function selectBestChartForQuestion(
  question: string,
  data: ParsedData
): ChartType | null {
  const q = question.toLowerCase();
  
  // Explicit chart type requests
  if (q.includes('دائر') || q.includes('pie')) return 'pie';
  if (q.includes('دونات') || q.includes('donut') || q.includes('حلقي')) return 'donut';
  if (q.includes('أعمد') || q.includes('bar')) return 'bar';
  if (q.includes('خط') || q.includes('line')) return 'line';
  if (q.includes('مساح') || q.includes('area')) return 'area';
  if (q.includes('نقاط') || q.includes('scatter') || q.includes('مبعثر')) return 'scatter';
  if (q.includes('فقاع') || q.includes('bubble')) return 'bubble';
  if (q.includes('عنكبوت') || q.includes('radar')) return 'radar';
  if (q.includes('شجر') || q.includes('treemap')) return 'treemap';
  if (q.includes('قمع') || q.includes('funnel')) return 'funnel';
  if (q.includes('شلال') || q.includes('waterfall')) return 'waterfall';
  if (q.includes('مكدس') || q.includes('stacked')) return 'stacked-bar';
  if (q.includes('مجمع') || q.includes('grouped')) return 'grouped-bar';
  if (q.includes('histogram') || q.includes('تكراري')) return 'histogram';
  
  // Intent-based selection
  const recommendations = recommendCharts(data, question);
  return recommendations.length > 0 ? recommendations[0].type : null;
}

/**
 * تحويل البيانات لتناسب نوع المخطط المحدد
 */
export function prepareChartData(
  data: ParsedData,
  chartType: ChartType,
  options: {
    categoryColumn?: string;
    numericColumn?: string;
    secondNumericColumn?: string;
    axisSelections?: Record<string, string>;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    topN?: number;
  }
): { data: any[]; config: any; error?: string } {
  let { categoryColumn, numericColumn, secondNumericColumn, axisSelections, aggregation = 'sum', topN = 10 } = options;
  
  // Use axis selections if provided
  if (axisSelections && Object.keys(axisSelections).length > 0) {
    categoryColumn = categoryColumn || axisSelections.category;
    numericColumn = numericColumn || axisSelections.value || axisSelections.x;
    secondNumericColumn = secondNumericColumn || axisSelections.y;
    
    // For stacked/grouped charts
    if (axisSelections.subCategory && !categoryColumn) {
      categoryColumn = axisSelections.subCategory;
    }
  }
  
  const numericCols = data.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = data.columns.filter((c) => c.type === 'categorical');
  const dateCols = data.columns.filter((c) => c.type === 'date');
  
  // Auto-detect missing columns
  if (!categoryColumn && categoricalCols.length > 0) {
    categoryColumn = categoricalCols[0].name;
  }
  if (!numericColumn && numericCols.length > 0) {
    numericColumn = numericCols[0].name;
  }
  if (!secondNumericColumn && numericCols.length >= 2) {
    secondNumericColumn = numericCols.find((c) => c.name !== numericColumn)?.name;
  }
  
  switch (chartType) {
    case 'bar':
    case 'horizontal-bar':
    case 'pie':
    case 'donut':
    case 'treemap':
    case 'funnel': {
      if (!categoryColumn) {
        return { 
          data: [], 
          config: {}, 
          error: `لا يوجد عمود فئوي في البيانات لعرض ${CHART_METADATA[chartType].label}` 
        };
      }
      return {
        data: aggregateByCategory(data, categoryColumn, numericColumn, aggregation, topN),
        config: { categoryKey: 'name', valueKey: 'value' },
      };
    }
    
    case 'line':
    case 'area': {
      if (!categoryColumn) {
        return { 
          data: [], 
          config: {}, 
          error: `لا يوجد عمود فئوي لعرض الاتجاهات` 
        };
      }
      return {
        data: aggregateByCategory(data, categoryColumn, numericColumn, aggregation, topN),
        config: { categoryKey: 'name', valueKey: 'value' },
      };
    }
    
    case 'scatter': {
      if (numericCols.length < 2) {
        return {
          data: [],
          config: {},
          error: `مخطط النقاط المبعثرة يتطلب عمودين رقميين على الأقل. البيانات تحتوي على ${numericCols.length} عمود رقمي فقط.`
        };
      }
      const xCol = numericColumn || numericCols[0].name;
      const yCol = secondNumericColumn || numericCols.find((c) => c.name !== xCol)?.name || numericCols[1].name;
      return {
        data: buildScatterData(data, xCol, yCol),
        config: { xKey: 'x', yKey: 'y', nameKey: 'name' },
      };
    }
    
    case 'bubble': {
      if (numericCols.length < 2) {
        return {
          data: [],
          config: {},
          error: `مخطط الفقاعات يتطلب عمودين رقميين على الأقل`
        };
      }
      const xCol = numericColumn || numericCols[0].name;
      const yCol = secondNumericColumn || numericCols.find((c) => c.name !== xCol)?.name || numericCols[1].name;
      const zCol = numericCols.find((c) => c.name !== xCol && c.name !== yCol)?.name;
      return {
        data: buildBubbleData(data, xCol, yCol, zCol),
        config: { xKey: 'x', yKey: 'y', zKey: 'z' },
      };
    }
    
    case 'histogram': {
      if (!numericColumn && numericCols.length === 0) {
        return {
          data: [],
          config: {},
          error: `المخطط التكراري يتطلب عموداً رقمياً`
        };
      }
      return {
        data: buildHistogramData(data, numericColumn!),
        config: { categoryKey: 'range', valueKey: 'count' },
      };
    }
    
    case 'radar': {
      if (!categoryColumn) {
        return {
          data: [],
          config: {},
          error: `المخطط العنكبوتي يتطلب عموداً فئوياً`
        };
      }
      return {
        data: buildRadarData(data, categoryColumn, numericColumn),
        config: { subjectKey: 'subject', valueKey: 'value' },
      };
    }
    
    case 'stacked-bar':
    case 'grouped-bar': {
      if (!categoryColumn) {
        return {
          data: [],
          config: {},
          error: `المخطط المكدس/المجمع يتطلب عموداً فئوياً`
        };
      }
      if (numericCols.length < 1) {
        return {
          data: [],
          config: {},
          error: `المخطط المكدس/المجمع يتطلب عموداً رقمياً واحداً على الأقل`
        };
      }
      return {
        data: buildStackedData(data, categoryColumn, numericColumn!),
        config: { categoryKey: 'name' },
      };
    }
    
    case 'stacked-area': {
      if (!categoryColumn) {
        return {
          data: [],
          config: {},
          error: `المخطط يتطلب عموداً فئوياً`
        };
      }
      return {
        data: buildStackedData(data, categoryColumn, numericColumn!),
        config: { categoryKey: 'name' },
      };
    }
    
    case 'waterfall': {
      if (!categoryColumn) {
        return {
          data: [],
          config: {},
          error: `مخطط الشلال يتطلب عموداً فئوياً`
        };
      }
      return {
        data: buildWaterfallData(data, categoryColumn, numericColumn!),
        config: { categoryKey: 'name', valueKey: 'value' },
      };
    }
    
    case 'time-series': {
      if (dateCols.length === 0) {
        return {
          data: [],
          config: {},
          error: `السلسلة الزمنية تتطلب عمود تاريخ في البيانات. لم يتم اكتشاف أي عمود تاريخ.`
        };
      }
      if (!numericColumn) {
        return {
          data: [],
          config: {},
          error: `السلسلة الزمنية تتطلب عموداً رقمياً`
        };
      }
      return {
        data: buildTimeSeriesData(data, numericColumn),
        config: { dateKey: 'date', valueKey: 'value' },
      };
    }
    
    case 'composed': {
      if (!categoryColumn) {
        return {
          data: [],
          config: {},
          error: `المخطط المركب يتطلب عموداً فئوياً`
        };
      }
      return {
        data: aggregateByCategory(data, categoryColumn, numericColumn, aggregation, topN),
        config: { categoryKey: 'name', valueKey: 'value' },
      };
    }
    
    default:
      return { data: [], config: {} };
  }
}

// Helper functions
function aggregateByCategory(
  data: ParsedData,
  categoryCol: string,
  numericCol?: string,
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum',
  topN: number = 10
): { name: string; value: number }[] {
  const map = new Map<string, { sum: number; count: number; min: number; max: number }>();
  
  for (const row of data.rows) {
    const cat = String(row[categoryCol] ?? 'غير محدد');
    const num = numericCol ? Number(row[numericCol]) : 1;
    if (isNaN(num)) continue;
    
    const curr = map.get(cat) || { sum: 0, count: 0, min: Infinity, max: -Infinity };
    curr.sum += num;
    curr.count += 1;
    curr.min = Math.min(curr.min, num);
    curr.max = Math.max(curr.max, num);
    map.set(cat, curr);
  }
  
  const result = Array.from(map.entries()).map(([name, { sum, count, min, max }]) => {
    let value: number;
    switch (aggregation) {
      case 'avg': value = sum / count; break;
      case 'count': value = count; break;
      case 'min': value = min; break;
      case 'max': value = max; break;
      default: value = sum;
    }
    return { name: name.length > 20 ? name.slice(0, 18) + '…' : name, value: Math.round(value * 100) / 100 };
  });
  
  return result.sort((a, b) => b.value - a.value).slice(0, topN);
}

function buildScatterData(
  data: ParsedData,
  xCol: string,
  yCol: string
): { x: number; y: number; name: string }[] {
  return data.rows
    .map((row, i) => ({
      x: Number(row[xCol]),
      y: Number(row[yCol]),
      name: `نقطة ${i + 1}`,
    }))
    .filter((d) => !isNaN(d.x) && !isNaN(d.y))
    .slice(0, 100);
}

function buildBubbleData(
  data: ParsedData,
  xCol: string,
  yCol: string,
  zCol?: string
): { x: number; y: number; z: number }[] {
  return data.rows
    .map((row) => ({
      x: Number(row[xCol]),
      y: Number(row[yCol]),
      z: zCol ? Number(row[zCol]) : 100,
    }))
    .filter((d) => !isNaN(d.x) && !isNaN(d.y) && !isNaN(d.z))
    .slice(0, 50);
}

function buildHistogramData(
  data: ParsedData,
  numericCol: string
): { range: string; count: number }[] {
  const values = data.rows
    .map((r) => Number(r[numericCol]))
    .filter((v) => !isNaN(v));
  
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bins = Math.min(10, Math.ceil(Math.sqrt(values.length)));
  const binWidth = (max - min) / bins;
  
  const histogram = Array(bins).fill(0);
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    histogram[idx]++;
  }
  
  return histogram.map((count, i) => ({
    range: `${Math.round(min + i * binWidth)}-${Math.round(min + (i + 1) * binWidth)}`,
    count,
  }));
}

function buildRadarData(
  data: ParsedData,
  categoryCol: string,
  numericCol?: string
): { subject: string; value: number; fullMark: number }[] {
  const aggregated = aggregateByCategory(data, categoryCol, numericCol, 'sum', 8);
  const maxVal = Math.max(...aggregated.map((d) => d.value));
  return aggregated.map((d) => ({
    subject: d.name,
    value: d.value,
    fullMark: maxVal,
  }));
}

function buildStackedData(
  data: ParsedData,
  categoryCol: string,
  _numericCol: string
): any[] {
  const categories = [...new Set(data.rows.map((r) => String(r[categoryCol])))].slice(0, 10);
  const numericCols = data.columns.filter((c) => c.type === 'numeric').slice(0, 3);
  
  return categories.map((cat) => {
    const row: any = { name: cat };
    for (const col of numericCols) {
      const sum = data.rows
        .filter((r) => String(r[categoryCol]) === cat)
        .reduce((acc, r) => acc + (Number(r[col.name]) || 0), 0);
      row[col.name] = Math.round(sum * 100) / 100;
    }
    return row;
  });
}

function buildWaterfallData(
  data: ParsedData,
  categoryCol: string,
  numericCol: string
): { name: string; value: number }[] {
  return aggregateByCategory(data, categoryCol, numericCol, 'sum', 10);
}

function buildTimeSeriesData(
  data: ParsedData,
  numericCol: string
): { date: string; value: number }[] {
  const dateCol = data.columns.find((c) => c.type === 'date')?.name;
  if (!dateCol) return [];
  
  const map = new Map<string, number>();
  for (const row of data.rows) {
    const d = new Date(String(row[dateCol]));
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const num = Number(row[numericCol]);
    if (isNaN(num)) continue;
    map.set(key, (map.get(key) || 0) + num);
  }
  
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: Math.round(value * 100) / 100 }));
}
