import type { ParsedData } from './dataParser';
import { buildDataSummary } from './dataParser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type ChartTypeString =
  | 'bar' | 'horizontal-bar' | 'line' | 'area' | 'pie' | 'donut'
  | 'scatter' | 'bubble' | 'histogram' | 'radar' | 'treemap'
  | 'funnel' | 'waterfall' | 'stacked-bar' | 'stacked-area'
  | 'grouped-bar' | 'composed' | 'time-series';

export interface ChatVisualization {
  type: ChartTypeString;
  title: string;
  subtitle?: string;
  categoryColumn?: string;
  numericColumn?: string;
  secondNumericColumn?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  topN?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  visualizations?: ChatVisualization[];
  suggestions?: string[];
  timestamp: number;
  isLoading?: boolean;
}

export interface ChatResponse {
  text: string;
  visualizations: ChatVisualization[];
  suggestions: string[];
}

export async function chatWithData(
  apiKey: string,
  data: ParsedData,
  question: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  const dataSummary = buildDataSummary(data);

  const availableColumns = data.columns
    .map((c) => `- ${c.name} (${c.type})`)
    .join('\n');

  const historyContext = history.length > 0
    ? `\n\nسجل المحادثة السابقة:\n${history
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.text}`)
        .join('\n')}\n`
    : '';

  const prompt = `أنت محلل بيانات ذكي وخبير ذكاء أعمال محترف. لديك إمكانية إنشاء تصورات بيانية احترافية من أنواع متعددة، واقتراح أسئلة متابعة ذكية.

البيانات المتاحة:
${dataSummary}

الأعمدة المتاحة:
${availableColumns}
${historyContext}
السؤال/الطلب الحالي: ${question}

## أنواع التصورات المتاحة (اختر الأنسب حسب البيانات والسؤال):

### المخططات الأساسية:
- "bar" - أعمدة رأسية: لمقارنة القيم بين الفئات (2-15 فئة)
- "horizontal-bar" - أعمدة أفقية: للأسماء الطويلة أو >10 فئات
- "line" - خطي: لعرض الاتجاهات والتطور (≥3 نقاط)
- "area" - مساحة: لعرض الحجم الكلي والتغيرات
- "pie" - دائري: للنسب المئوية (2-7 فئات فقط)
- "donut" - حلقي: بديل عصري للدائري مع عرض المجموع في المنتصف

### المخططات الإحصائية:
- "scatter" - نقاط مبعثرة: لإظهار العلاقة بين عمودين رقميين
- "bubble" - فقاعات: لثلاثة أبعاد من البيانات
- "histogram" - تكراري: لعرض توزيع قيم عمود رقمي واحد

### المخططات المتقدمة:
- "radar" - عنكبوتي: لمقارنة متعددة الأبعاد (3-8 محاور)
- "treemap" - شجري: لعرض البيانات الهرمية كأحجام نسبية
- "funnel" - قمعي: لعرض مراحل العملية والتحويل
- "waterfall" - شلال: لعرض التأثيرات التراكمية (ربح/خسارة)
- "stacked-bar" - أعمدة مكدسة: لمقارنة التركيب الداخلي
- "grouped-bar" - أعمدة مجمعة: لمقارنة مجموعات متعددة جنباً إلى جنب
- "stacked-area" - مساحة مكدسة: للتراكم عبر الزمن
- "composed" - مركب: دمج أعمدة وخطوط في مخطط واحد

### للسلاسل الزمنية:
- "time-series" - سلسلة زمنية: للبيانات مع عمود تاريخ

## قواعد اختيار المخطط الذكي:
1. **للنسب والتوزيع** (2-7 فئات) → pie أو donut
2. **للمقارنة والترتيب** → bar أو horizontal-bar
3. **للاتجاهات عبر الزمن** → time-series أو line
4. **للعلاقة بين متغيرين رقميين** → scatter
5. **للبيانات الهرمية** → treemap
6. **للمراحل/التحويل** → funnel
7. **لمقارنة متعددة الأبعاد** → radar
8. **للحجم والتراكم** → area أو stacked-area
9. **للتوزيع التكراري** → histogram
10. **إذا كان >10 فئات** → horizontal-bar بدلاً من bar

## التعليمات:
1. أجب عن السؤال بإجابة واضحة ومفيدة بالعربية
2. استخدم الأرقام الفعلية من البيانات لدعم إجابتك
3. إذا كان السؤال يتضمن عرض بيانات أو مقارنة أو تحليل، اقترح 1-2 تصورات بيانية
4. **اختر نوع المخطط الأنسب** بناءً على قواعد الاختيار أعلاه وطبيعة البيانات
5. aggregation: "sum" (مجموع)، "avg" (متوسط)، "count" (عدد)، "min" (أدنى)، "max" (أعلى)
6. لا تقترح تصورات بأعمدة غير موجودة في البيانات
7. إذا كان السؤال نظرياً بسيطاً لا يحتاج رسم، أرسل visualizations كمصفوفة فارغة
8. **اقترح 3-4 أسئلة متابعة ذكية ومخصصة للبيانات الحالية**:
   - **مهم جداً**: استخدم أسماء الأعمدة الفعلية المذكورة أعلاه في كل اقتراح
   - كل اقتراح يجب أن يكون قابلاً للتنفيذ مباشرة على هذه البيانات المحددة
   - استكشف علاقات أو أنماط أو مقارنات لم تُناقش بعد
   - اجعل الاقتراحات قصيرة ومباشرة (8-15 كلمة)
   - بعض الاقتراحات يجب أن تطلب تصورات بيانية محددة
9. تنوع الأسئلة المقترحة:
   - تحليلي: "ما الفرق بين X و Y في عمود Z؟"
   - تصوري: "ارسم توزيع X حسب Y"
   - استكشافي: "ما العلاقة بين X و Y؟"
   - ترتيب: "ما أفضل 5 قيم في X؟"
10. اطلب المخطط الذي يعرض الإجابة بأفضل طريقة بصرية

أرجع JSON فقط بدون markdown بالشكل التالي:
{
  "text": "إجابتك النصية الواضحة والمفصلة بالعربية",
  "visualizations": [
    {
      "type": "bar",
      "title": "عنوان الرسم بالعربية",
      "subtitle": "وصف مختصر يوضح ما يظهره المخطط",
      "categoryColumn": "اسم العمود الفئوي الموجود",
      "numericColumn": "اسم العمود الرقمي الموجود أو فارغ",
      "aggregation": "sum",
      "topN": 10
    }
  ],
  "suggestions": [
    "سؤال متابعة ذكي 1",
    "سؤال متابعة ذكي 2",
    "سؤال متابعة ذكي 3"
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { text, visualizations: [], suggestions: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize visualizations
    const validTypes = [
      'bar', 'horizontal-bar', 'line', 'area', 'pie', 'donut',
      'scatter', 'bubble', 'histogram', 'radar', 'treemap',
      'funnel', 'waterfall', 'stacked-bar', 'stacked-area',
      'grouped-bar', 'composed', 'time-series',
    ];
    const validAggs = ['sum', 'avg', 'count', 'min', 'max'];
    const columnNames = data.columns.map((c) => c.name);

    const visualizations: ChatVisualization[] = (parsed.visualizations || [])
      .filter((v: ChatVisualization) => v && validTypes.includes(v.type))
      .map((v: ChatVisualization) => ({
        type: v.type,
        title: v.title || 'تصور بياني',
        subtitle: v.subtitle,
        categoryColumn: v.categoryColumn && columnNames.includes(v.categoryColumn) ? v.categoryColumn : undefined,
        numericColumn: v.numericColumn && columnNames.includes(v.numericColumn) ? v.numericColumn : undefined,
        aggregation: v.aggregation && validAggs.includes(v.aggregation) ? v.aggregation : 'sum',
        topN: v.topN || 10,
      }))
      .filter((v: ChatVisualization) => v.categoryColumn || v.numericColumn)
      .slice(0, 3);

    // Validate and sanitize suggestions
    const suggestions: string[] = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
          .slice(0, 4)
          .map((s: string) => s.trim())
      : [];
    
    return {
      text: parsed.text || text,
      visualizations,
      suggestions,
    };
  } catch {
    return { text: text.replace(/```json\n?|```/g, '').trim(), visualizations: [], suggestions: [] };
  }
}
