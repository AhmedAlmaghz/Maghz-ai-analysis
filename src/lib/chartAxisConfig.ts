import type { ChartType } from './chartRecommendations';

export interface AxisDefinition {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  required: boolean;
  acceptedTypes: ('numeric' | 'categorical' | 'date' | 'text')[];
  preferredType?: 'numeric' | 'categorical' | 'date' | 'text';
  allowEmpty?: boolean;
}

export interface ChartAxisConfig {
  chartType: ChartType;
  axes: AxisDefinition[];
  description: string;
}

/**
 * تعريف المحاور لكل نوع مخطط
 */
export const CHART_AXIS_CONFIGS: Record<ChartType, ChartAxisConfig> = {
  'bar': {
    chartType: 'bar',
    description: 'مقارنة القيم بين الفئات',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات (X)',
        description: 'الفئات التي تريد مقارنتها',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم (Y)',
        description: 'القيم الرقمية للمقارنة',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'horizontal-bar': {
    chartType: 'horizontal-bar',
    description: 'مقارنة القيم مع أسماء طويلة',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات (Y)',
        description: 'الفئات التي تريد مقارنتها',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم (X)',
        description: 'القيم الرقمية للمقارنة',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'line': {
    chartType: 'line',
    description: 'عرض الاتجاهات عبر الزمن أو الفئات',
    axes: [
      {
        id: 'category',
        label: 'Category/Time Axis',
        labelAr: 'محور الفئات/الزمن (X)',
        description: 'البُعد الزمني أو الفئوي',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'date',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم (Y)',
        description: 'القيم الرقمية للاتجاه',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'area': {
    chartType: 'area',
    description: 'عرض الحجم الكلي والتغيرات',
    axes: [
      {
        id: 'category',
        label: 'Category/Time Axis',
        labelAr: 'محور الفئات/الزمن (X)',
        description: 'البُعد الزمني أو الفئوي',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'date',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم (Y)',
        description: 'القيم الرقمية للحجم',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'pie': {
    chartType: 'pie',
    description: 'النسب المئوية لفئات قليلة',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات',
        description: 'الفئات لتوزيع النسب',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم لحساب النسب',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'donut': {
    chartType: 'donut',
    description: 'بديل عصري للمخطط الدائري',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات',
        description: 'الفئات لتوزيع النسب',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم لحساب النسب',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'scatter': {
    chartType: 'scatter',
    description: 'إظهار العلاقة بين متغيرين',
    axes: [
      {
        id: 'x',
        label: 'X Axis',
        labelAr: 'المحور السيني (X)',
        description: 'المتغير الأول',
        required: true,
        acceptedTypes: ['numeric', 'date'],
        preferredType: 'numeric',
      },
      {
        id: 'y',
        label: 'Y Axis',
        labelAr: 'المحور الصادي (Y)',
        description: 'المتغير الثاني',
        required: true,
        acceptedTypes: ['numeric', 'date'],
        preferredType: 'numeric',
      },
      {
        id: 'category',
        label: 'Category/Color',
        labelAr: 'التصنيف/اللون (اختياري)',
        description: 'تصنيف النقاط بألوان مختلفة',
        required: false,
        acceptedTypes: ['categorical', 'text'],
        allowEmpty: true,
      },
    ],
  },
  
  'bubble': {
    chartType: 'bubble',
    description: '3 أبعاد من البيانات',
    axes: [
      {
        id: 'x',
        label: 'X Axis',
        labelAr: 'المحور السيني (X)',
        description: 'المتغير الأول',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
      {
        id: 'y',
        label: 'Y Axis',
        labelAr: 'المحور الصادي (Y)',
        description: 'المتغير الثاني',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
      {
        id: 'size',
        label: 'Size Axis',
        labelAr: 'محور الحجم (Z)',
        description: 'حجم الفقاعات',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
      {
        id: 'category',
        label: 'Category/Color',
        labelAr: 'التصنيف/اللون (اختياري)',
        description: 'تصنيف الفقاعات بألوان مختلفة',
        required: false,
        acceptedTypes: ['categorical', 'text'],
        allowEmpty: true,
      },
    ],
  },
  
  'histogram': {
    chartType: 'histogram',
    description: 'توزيع القيم الرقمية',
    axes: [
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'العمود الرقمي للتوزيع',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'radar': {
    chartType: 'radar',
    description: 'مقارنة متعددة الأبعاد',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات',
        description: 'الفئات للمقارنة (3-8 فئات)',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم للمقارنة',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'treemap': {
    chartType: 'treemap',
    description: 'عرض البيانات الهرمية',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات',
        description: 'الفئات كأحجام نسبية',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم لتحديد الأحجام',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'funnel': {
    chartType: 'funnel',
    description: 'مراحل العملية والتحويل',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور المراحل',
        description: 'المراحل بالترتيب',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم لكل مرحلة',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'waterfall': {
    chartType: 'waterfall',
    description: 'عرض التأثيرات التراكمية',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات',
        description: 'الفئات أو المراحل',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم (موجبة/سالبة)',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'stacked-bar': {
    chartType: 'stacked-bar',
    description: 'مقارنة التركيب الداخلي',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات الرئيسي',
        description: 'الفئات الرئيسية',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'subCategory',
        label: 'Sub-Category Axis',
        labelAr: 'محور الفئات الفرعي',
        description: 'الفئات الفرعية للتكديس',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم للتكديس',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'grouped-bar': {
    chartType: 'grouped-bar',
    description: 'مقارنة مجموعات متعددة',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات الرئيسي',
        description: 'الفئات الرئيسية',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'subCategory',
        label: 'Sub-Category Axis',
        labelAr: 'محور الفئات الفرعي',
        description: 'الفئات الفرعية للتجميع',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم للتجميع',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'stacked-area': {
    chartType: 'stacked-area',
    description: 'التراكم عبر الزمن',
    axes: [
      {
        id: 'category',
        label: 'Category/Time Axis',
        labelAr: 'محور الفئات/الزمن',
        description: 'البُعد الزمني أو الفئوي',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'date',
      },
      {
        id: 'subCategory',
        label: 'Sub-Category Axis',
        labelAr: 'محور الفئات الفرعي',
        description: 'الفئات الفرعية للتكديس',
        required: true,
        acceptedTypes: ['categorical', 'text'],
        preferredType: 'categorical',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم',
        description: 'القيم للتكديس',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'composed': {
    chartType: 'composed',
    description: 'مخطط يجمع بين أنواع مختلفة',
    axes: [
      {
        id: 'category',
        label: 'Category Axis',
        labelAr: 'محور الفئات (X)',
        description: 'الفئات الرئيسية',
        required: true,
        acceptedTypes: ['categorical', 'text', 'date'],
        preferredType: 'categorical',
      },
      {
        id: 'barValue',
        label: 'Bar Value',
        labelAr: 'قيم الأعمدة',
        description: 'القيم للأعمدة',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
      {
        id: 'lineValue',
        label: 'Line Value',
        labelAr: 'قيم الخطوط',
        description: 'القيم للخطوط',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
  
  'time-series': {
    chartType: 'time-series',
    description: 'البيانات المرتبطة بالزمن',
    axes: [
      {
        id: 'date',
        label: 'Date Axis',
        labelAr: 'محور التاريخ (X)',
        description: 'العمود الزمني',
        required: true,
        acceptedTypes: ['date'],
        preferredType: 'date',
      },
      {
        id: 'value',
        label: 'Value Axis',
        labelAr: 'محور القيم (Y)',
        description: 'القيم الرقمية',
        required: true,
        acceptedTypes: ['numeric'],
        preferredType: 'numeric',
      },
    ],
  },
};

/**
 * التحقق من توافق نوع العمود مع المحور
 */
export function isColumnCompatible(
  columnType: 'numeric' | 'categorical' | 'date' | 'text',
  axisDef: AxisDefinition
): boolean {
  return axisDef.acceptedTypes.includes(columnType);
}

/**
 * الحصول على رسالة تحذير إذا كان نوع العمود غير مفضل
 */
export function getColumnWarning(
  columnType: 'numeric' | 'categorical' | 'date' | 'text',
  axisDef: AxisDefinition
): string | null {
  if (!isColumnCompatible(columnType, axisDef)) {
    return `نوع العمود (${columnType}) غير متوافق مع هذا المحور`;
  }
  
  if (axisDef.preferredType && columnType !== axisDef.preferredType) {
    return `النوع المفضل هو ${axisDef.preferredType}، لكن ${columnType} سيعمل`;
  }
  
  return null;
}
