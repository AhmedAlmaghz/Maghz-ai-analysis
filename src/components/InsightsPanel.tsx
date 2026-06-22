import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertTriangle,
  Target,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Send,
  Trash2,
  User,
  Bot,
} from 'lucide-react';
import type { AIAnalysis } from '../lib/gemini';
import type { ParsedData } from '../lib/dataParser';
import type { ChatMessage } from '../lib/chat';
import { chatWithData } from '../lib/chat';
import { ChatChart } from './ChatChart';

interface Props {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  apiKey: string;
  data: ParsedData | null;
  initialMessages?: ChatMessage[];
  onChatUpdate?: (messages: ChatMessage[]) => void;
  showOnlyChat?: boolean;
  onStartAnalysis?: () => void;
}

export function InsightsPanel({
  analysis,
  isLoading,
  apiKey,
  data,
  initialMessages = [],
  onChatUpdate,
  showOnlyChat = false,
  onStartAnalysis,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Initialize messages only once on mount - prevents re-renders from resetting local state
  useEffect(() => {
    if (!initializedRef.current) {
      setMessages(initialMessages);
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Debounced save to avoid excessive updates
  useEffect(() => {
    if (!initializedRef.current) return;
    
    const toSave = messages.filter((m) => !m.isLoading);
    
    // Debounce save to avoid calling onChatUpdate on every character/message change
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (onChatUpdate) onChatUpdate(toSave);
    }, 500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, onChatUpdate]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleAsk = async (questionOverride?: string) => {
    const question = (questionOverride ?? inputValue).trim();
    if (!question || !data || !apiKey || isAsking) return;
    setInputValue('');
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: Date.now(),
    };
    
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      text: '...',
      timestamp: Date.now(),
      isLoading: true,
    };
    
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInputValue('');
    setIsAsking(true);
    
    try {
      const currentHistory = messages.filter((m) => !m.isLoading);
      const result = await chatWithData(apiKey, data, question, currentHistory);
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result.text,
        visualizations: result.visualizations,
        suggestions: result.suggestions,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(assistantMsg));
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ حدث خطأ: ${err instanceof Error ? err.message : 'غير معروف'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errorMsg));
    } finally {
      setIsAsking(false);
    }
  };
  
  const clearHistory = () => {
    if (confirm('هل تريد مسح سجل الدردشة بالكامل؟')) {
      setMessages([]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="glass rounded-2xl border border-white/20 p-12 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">الذكاء الاصطناعي يحلل بياناتك...</h3>
            <p className="text-sm text-slate-500">يتم استخراج الرؤى والتنبؤات</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Chat section (extracted)
  const chatSection = apiKey && data ? (
    <div className="glass rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-pink-500/10 to-rose-500/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">دردشة ذكية مع البيانات</h3>
            <p className="text-xs text-slate-500">
              {messages.length > 0 ? `${messages.length} رسالة محفوظة` : 'اطرح أي سؤال واطلب تصورات بيانية'}
            </p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            مسح السجل
          </button>
        )}
      </div>
      
      <div
        ref={scrollRef}
        className="max-h-[500px] min-h-[200px] overflow-y-auto scrollbar-thin bg-gradient-to-b from-slate-50/50 to-white/50 p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 p-4">
              <Bot className="h-8 w-8 text-pink-500" />
            </div>
            <h4 className="mb-2 font-bold text-slate-900">ابدأ المحادثة</h4>
            <p className="text-sm text-slate-500 max-w-md mb-4">
              اسأل أي سؤال عن بياناتك أو اطلب تصورات بيانية مثل:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                'ما أفضل فئة مبيعاً؟',
                'ارسم توزيع المنتجات',
                'قارن بين المبيعات بالأعمدة',
                'ما متوسط الأسعار حسب الفئة؟',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs text-pink-700 hover:bg-pink-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Find the latest assistant message (not loading)
            const latestAssistantIndex = [...messages].reverse().findIndex(
              (m) => m.role === 'assistant' && !m.isLoading
            );
            const isLatestAssistant = 
              msg.role === 'assistant' && 
              !msg.isLoading &&
              index === messages.length - 1 - latestAssistantIndex;
            
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                data={data}
                isLatestAssistant={isLatestAssistant}
                onSuggestionClick={(suggestion) => {
                  // Show the suggestion in input briefly, then auto-send
                  setInputValue(suggestion);
                  setTimeout(() => {
                    handleAsk(suggestion);
                  }, 150);
                }}
              />
            );
          })
        )}
      </div>
      
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
            placeholder="اسأل أو اطلب تصوراً... مثال: ارسم توزيع الفئات"
            disabled={isAsking}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isAsking || !inputValue.trim()}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAsking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400 text-center">
          💡 يمكنك طلب تصورات بيانية، وستُحفظ المحادثة تلقائياً في المشروع
        </p>
      </div>
    </div>
  ) : null;
  
  // If showOnlyChat mode, render only chat
  if (showOnlyChat) {
    return <div className="space-y-6">{chatSection}</div>;
  }
  
  // Show "ready to analyze" screen when no analysis yet
  if (!analysis && data && onStartAnalysis) {
    return (
      <div className="glass rounded-2xl border border-white/20 p-12 shadow-xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl animate-float">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg animate-pulse" />
          </div>
          
          <div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900 font-display">
              جاهز للتحليل الذكي
            </h3>
            <p className="text-slate-600 max-w-md leading-relaxed">
              بياناتك ({data.rows.length} صف و {data.columns.length} عمود) جاهزة للتحليل.
              <br />
              سيقوم الذكاء الاصطناعي باستخراج الرؤى والتنبؤات والتوصيات.
            </p>
          </div>
          
          {!apiKey ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 max-w-md">
              <p className="text-sm text-amber-800">
                ⚠️ يرجى إضافة مفتاح Gemini API من الإعدادات أولاً لبدء التحليل
              </p>
            </div>
          ) : (
            <button
              onClick={onStartAnalysis}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shimmer"
            >
              <Sparkles className="h-5 w-5" />
              {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل الآن'}
            </button>
          )}
          
          <div className="mt-4 grid grid-cols-3 gap-4 max-w-lg">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-3">
              <Lightbulb className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-amber-800 font-medium">رؤى ذكية</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-3">
              <Target className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs text-indigo-800 font-medium">تنبؤات</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-emerald-800 font-medium">توصيات</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analysis) return null;
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass rounded-2xl border border-white/20 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-bold text-slate-900">الملخص التنفيذي</h3>
            <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      </div>
      
      {/* KPIs */}
      {analysis.kpis && analysis.kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {analysis.kpis.map((kpi, i) => {
            const sentiment = kpi.sentiment || 'neutral';
            const Icon = sentiment === 'up' ? TrendingUp : sentiment === 'down' ? TrendingDown : Minus;
            const colorClass =
              sentiment === 'up'
                ? 'from-emerald-500 to-teal-600'
                : sentiment === 'down'
                ? 'from-rose-500 to-red-600'
                : 'from-slate-500 to-slate-600';
            
            return (
              <div
                key={i}
                className="glass rounded-2xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`rounded-lg bg-gradient-to-br ${colorClass} p-1.5 text-white`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {kpi.change && (
                    <span
                      className={`text-xs font-semibold ${
                        sentiment === 'up'
                          ? 'text-emerald-600'
                          : sentiment === 'down'
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-1 line-clamp-2">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-900 truncate">{kpi.value}</p>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightCard
          title="الرؤى الرئيسية"
          icon={<Lightbulb className="h-5 w-5" />}
          iconColor="from-amber-500 to-orange-600"
          items={analysis.insights}
        />
        <InsightCard
          title="الاتجاهات الملحوظة"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="from-emerald-500 to-teal-600"
          items={analysis.trends}
        />
        <InsightCard
          title="الشذوذ والملاحظات"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="from-rose-500 to-red-600"
          items={analysis.anomalies}
        />
        <InsightCard
          title="التنبؤات المستقبلية"
          icon={<Target className="h-5 w-5" />}
          iconColor="from-indigo-500 to-purple-600"
          items={analysis.predictions}
        />
      </div>
      
      {/* Recommendations */}
      <div className="glass rounded-2xl border border-white/20 p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">التوصيات العملية</h3>
        </div>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow">
                {i + 1}
              </div>
              <p className="text-slate-700 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat */}
      {chatSection}
    </div>
  );
}

function MessageBubble({
  message,
  data,
  onSuggestionClick,
  isLatestAssistant,
}: {
  message: ChatMessage;
  data: ParsedData;
  onSuggestionClick?: (suggestion: string) => void;
  isLatestAssistant?: boolean;
}) {
  const isUser = message.role === 'user';
  const showSuggestions = !isUser && isLatestAssistant && message.suggestions && message.suggestions.length > 0 && onSuggestionClick;
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md ${
          isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'
        }`}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div
          className={`inline-block max-w-full rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">جاري التفكير...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
        
        {!isUser && message.visualizations && message.visualizations.length > 0 && (
          <div className="space-y-3 mt-3">
            {message.visualizations.map((viz, i) => (
              <ChatChart key={i} data={data} visualization={viz} />
            ))}
          </div>
        )}
        
        {/* Smart Suggestions */}
        {showSuggestions && (
          <div className="mt-3 animate-fade-in">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <p className="text-xs font-semibold text-slate-600">اقتراحات ذكية</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestions!.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="group flex items-center gap-1.5 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs text-indigo-700 transition-all hover:border-indigo-400 hover:from-indigo-100 hover:to-purple-100 hover:shadow-md hover:scale-[1.02]"
                >
                  <span className="text-indigo-400 group-hover:text-indigo-600">💡</span>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <p className={`text-xs text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  icon,
  iconColor,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="glass rounded-2xl border border-white/20 p-5 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${iconColor} shadow-lg text-white`}>
          {icon}
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-lg bg-white/50 p-3 text-sm text-slate-700 leading-relaxed"
          >
            <span className="shrink-0 text-slate-300 font-mono text-xs mt-0.5">0{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
