import { useState } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface Props {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const handleKeyChange = (value: string) => {
    onApiKeyChange(value);
    setIsValid(value.length > 20);
  };
  
  return (
    <div className="glass rounded-2xl border border-white/20 p-6 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Key className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">مفتاح Gemini API</h3>
          <p className="text-sm text-slate-500">أدخل مفتاحك الخاص للوصول إلى الذكاء الاصطناعي</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pl-12 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          dir="ltr"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {apiKey && (
        <div className="mt-3 flex items-center gap-2">
          {isValid ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">المفتاح جاهز</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">المفتاح قصير جداً</span>
            </>
          )}
        </div>
      )}
      
      <div className="mt-4 rounded-lg bg-indigo-50 p-3">
        <p className="text-xs text-indigo-700">
          <strong>💡 نصيحة:</strong> احصل على مفتاحك المجاني من{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-indigo-900"
          >
            Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
}
