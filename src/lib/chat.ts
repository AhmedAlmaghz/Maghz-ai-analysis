import type { ParsedData } from './dataParser';
import { buildDataSummary } from './dataParser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatVisualization {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  subtitle?: string;
  categoryColumn?: string;
  numericColumn?: string;
  aggregation?: 'sum' | 'avg' | 'count';
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

  const prompt = `أنت محلل بيانات ذكي وخبير ذكاء أعمال محترف. لديك إمكانية إنشاء تصورات بيانية واقتراح أسئلة متابعة ذكية.

البيانات المتاحة:
${dataSummary}

الأعمدة المتاحة:
${availableColumns}
${historyContext}
السؤال/الطلب الحالي: ${question}

تعليمات مهمة:
1. أجب عن السؤال بإجابة واضحة ومفيدة بالعربية
2. استخدم الأرقام الفعلية من البيانات لدعم إجابتك
3. إذا كان السؤال/الطلب يتضمن عرض بيانات أو مقارنة أو تحليل أو يحتاج رسم بياني، اقترح 1-2 تصورات بيانية مناسبة
4. أنواع التصورات المتاحة: "bar" (أعمدة)، "line" (خطية)، "pie" (دائرية)، "area" (مساحة)
5. aggregation: "sum" (مجموع)، "avg" (متوسط)، "count" (عدد)
6. type "pie" و "bar" يستخدمان categoryColumn فقط (لإظهار التوزيع)
7. type "line" و "area" يستخدمان عادة categoryColumn للعمود الزمني أو الفئوي و numericColumn للقيم
8. لا تقترح تصورات بأعمدة غير موجودة في البيانات
9. إذا كان السؤال نظرياً بسيطاً لا يحتاج رسم، أرسل visualizations كمصفوفة فارغة
10. اقترح 3-4 أسئلة متابعة ذكية ومختصرة مرتبطة بسياق السؤال والإجابة والأعمدة المتاحة
11. الأسئلة المقترحة يجب أن تكون عملية ومفيدة للمستخدم لاستكشاف البيانات بشكل أعمق
12. تنوع الأسئلة: بعضها تحليلي، بعضها تصوري، بعضها استكشافي

أرجع JSON فقط بدون markdown بالشكل التالي:
{
  "text": "إجابتك النصية الواضحة والمفصلة بالعربية",
  "visualizations": [
    {
      "type": "bar",
      "title": "عنوان الرسم بالعربية",
      "subtitle": "وصف مختصر",
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
    const validTypes = ['bar', 'line', 'pie', 'area'];
    const validAggs = ['sum', 'avg', 'count'];
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
