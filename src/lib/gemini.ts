import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedData } from './dataParser';
import { buildDataSummary } from './dataParser';
import { GEMINI_MODEL, extractJsonObject, withRetry, friendlyAIError } from './aiConfig';

export interface AIAnalysis {
  summary: string;
  insights: string[];
  trends: string[];
  anomalies: string[];
  predictions: string[];
  recommendations: string[];
  kpis: { label: string; value: string; change?: string; sentiment?: 'up' | 'down' | 'neutral' }[];
}

export async function analyzeWithGemini(
  apiKey: string,
  data: ParsedData,
  userQuestion?: string
): Promise<AIAnalysis> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const dataSummary = buildDataSummary(data);

  const prompt = `أنت محلل بيانات ذكي وخبير ذكاء أعمال محترف. لدي البيانات التالية، قم بتحليلها بعمق واستخراج رؤى قيمة.

${dataSummary}

${userQuestion ? `\nسؤال/طلب المستخدم: ${userQuestion}\n` : ''}

قم بإرجاع JSON فقط بدون أي نص إضافي، وبدون علامات markdown، بالشكل التالي:
{
  "summary": "ملخص تنفيذي شامل ومفيد عن البيانات بالعربية في 3-4 جمل",
  "insights": ["رؤية 1", "رؤية 2", "رؤية 3", "رؤية 4", "رؤية 5"],
  "trends": ["اتجاه ملحوظ 1", "اتجاه ملحوظ 2", "اتجاه ملحوظ 3"],
  "anomalies": ["شذوذ أو ملاحظة غير عادية 1", "ملاحظة 2"],
  "predictions": ["تنبؤ مدعوم بالأرقام 1", "تنبؤ 2", "تنبؤ 3"],
  "recommendations": ["توصية عملية 1", "توصية 2", "توصية 3", "توصية 4"],
  "kpis": [
    {"label": "اسم المؤشر", "value": "القيمة بالأرقام", "change": "نسبة التغيير", "sentiment": "up أو down أو neutral"}
  ]
}

ملاحظات مهمة:
- أجب بالعربية دائماً
- قدم 5 رؤى عميقة على الأقل
- قدم 3 تنبؤات على الأقل مدعومة بالأرقام والنسب المئوية
- قدم 4 توصيات عملية قابلة للتنفيذ
- قدم 3-5 مؤشرات أداء رئيسية (KPIs) مستخرجة من البيانات
- استخدم الأرقام الفعلية من البيانات في تحليلك
- حدد الاتجاهات (trends) والشذوذ (anomalies) بوضوح
- التنبؤات يجب أن تكون واقعية ومدعومة بالأنماط الموجودة في البيانات`;

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });

    // Extract JSON from response (handles markdown fences and surrounding prose)
    const jsonStr = extractJsonObject(text);
    if (!jsonStr) {
      throw new Error('فشل في استخراج JSON من استجابة الذكاء الاصطناعي');
    }

    const parsed = JSON.parse(jsonStr);
    return {
      summary: parsed.summary || '',
      insights: parsed.insights || [],
      trends: parsed.trends || [],
      anomalies: parsed.anomalies || [],
      predictions: parsed.predictions || [],
      recommendations: parsed.recommendations || [],
      kpis: parsed.kpis || [],
    };
  } catch (err) {
    throw new Error(friendlyAIError(err));
  }
}

export async function askAboutData(
  apiKey: string,
  data: ParsedData,
  question: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const dataSummary = buildDataSummary(data);

  const prompt = `أنت مساعد ذكاء أعمال محترف. بناءً على البيانات التالية:

${dataSummary}

أجب عن السؤال التالي بإجابة واضحة ومختصرة ومفيدة باللغة العربية. استخدم الأرقام الفعلية من البيانات لدعم إجابتك.

السؤال: ${question}`;

  try {
    return await withRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    });
  } catch (err) {
    throw new Error(friendlyAIError(err));
  }
}
