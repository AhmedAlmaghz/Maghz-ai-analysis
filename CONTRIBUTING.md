# 🤝 دليل المساهمة

شكراً لاهتمامك بالمساهمة في **محلل البيانات الذكي**! 🎉

هذا الدليل سيساعدك على البدء بالمساهمة بشكل فعال.

## 📋 جدول المحتويات

- [مدونة السلوك](#-مدونة-السلوك)
- [كيف يمكنني المساهمة؟](#-كيف-يمكنني-المساهمة)
- [إعداد البيئة التطويرية](#-إعداد-البيئة-التطويرية)
- [عملية المساهمة](#-عملية-المساهمة)
- [إرشادات الكود](#-إرشادات-الكود)
- [رسائل Commit](#-رسائل-commit)
- [اختبار التغييرات](#-اختبار-التغييرات)

## 📜 مدونة السلوك

نلتزم بخلق بيئة ترحيبية وإيجابية للجميع. يرجى:

- ✅ استخدام لغة ترحيبية وشاملة
- ✅ احترام وجهات النظر المختلفة
- ✅ قبول النقد البناء بلطف
- ✅ التركيز على ما هو أفضل للمجتمع
- ❌ تجنب التعليقات المهينة أو التمييزية

## 💡 كيف يمكنني المساهمة؟

### 🐛 الإبلاغ عن مشكلة

1. تحقق من [Issues](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues) الحالية
2. إذا لم تجد المشكلة، [افتح Issue جديدة](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues/new)
3. استخدم قالب المشكلة المناسب
4. قدم أكبر قدر ممكن من التفاصيل:
   - وصف واضح للمشكلة
   - خطوات إعادة الإنتاج
   - السلوك المتوقع vs الفعلي
   - لقطات شاشة إن أمكن
   - معلومات النظام (OS، المتصفح، الإصدار)

### ✨ اقتراح ميزة جديدة

1. تحقق من [Issues](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues) الحالية
2. [افتح Issue جديدة](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues/new?template=feature_request.md)
3. اشرح:
   - المشكلة التي تحلها الميزة
   - الحل المقترح
   - البدائل التي فكرت فيها
   - سياق إضافي أو لقطات شاشة

### 🔧 تحسين التوثيق

- تحسين README.md
- إضافة أمثلة استخدام
- ترجمة التوثيق
- تصحيح الأخطاء الإملائية

### 💻 المساهمة بالكود

راجع القسم التالي لإعداد البيئة التطويرية.

## 🛠️ إعداد البيئة التطويرية

### المتطلبات الأساسية

- **Node.js** 20 أو أحدث
- **npm** أو **yarn** أو **pnpm**
- **Git**
- محرر كود (VS Code موصى به)

### خطوات الإعداد

```bash
# 1. Fork المشروع على GitHub

# 2. Clone المشروع
git clone https://github.com/AhmedAlmaghz/Maghaz-ai-analysis.git
cd Maghaz-ai-analysis

# 3. أضف الـ upstream
git remote add upstream https://github.com/AhmedAlmaghz/Maghaz-ai-analysis.git

# 4. ثبت المكتبات
npm install

# 5. أنشئ فرعاً جديداً
git checkout -b feature/my-amazing-feature

# 6. شغل المشروع
npm run dev

# 7. افتح المتصفح على http://localhost:3000
```

### VS Code Extensions الموصى بها

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag"
  ]
}
```

## 📝 عملية المساهمة

### 1. اختر Issue

- ابحث عن Issues موسومة بـ `good first issue` أو `help wanted`
- علق على Issue لتأكيد أنك تعمل عليها
- اسأل إذا كان لديك أي استفسارات

### 2. أنشئ فرعاً

```bash
# للميزات الجديدة
git checkout -b feature/feature-name

# لإصلاح الأخطاء
git checkout -b fix/bug-name

# للتحسينات
git checkout -b chore/improvement-name

# للتوثيق
git checkout -b docs/documentation-update
```

### 3. اكتب الكود

- اتبع [إرشادات الكود](#-إرشادات-الكود)
- أضف تعليقات واضحة
- اختبر تغييراتك

### 4. Commit التغييرات

```bash
git add .
git commit -m "feat: add amazing feature"
```

راجع [رسائل Commit](#-رسائل-commit) للتفاصيل.

### 5. Push إلى GitHub

```bash
git push origin feature/feature-name
```

### 6. افتح Pull Request

1. اذهب إلى صفحة المشروع على GitHub
2. اضغط "New Pull Request"
3. اختر فرعك وفرع `main`
4. املأ قالب PR بالكامل
5. اربط الـ Issue ذات الصلة (مثال: `Closes #123`)

## 📏 إرشادات الكود

### TypeScript

```typescript
// ✅ جيد
interface User {
  id: string;
  name: string;
  email: string;
}

export function getUser(id: string): Promise<User> {
  // ...
}

// ❌ سيء
function getUser(id: any) {
  // ...
}
```

### React Components

```typescript
// ✅ جيد - Functional Component مع TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
    >
      {label}
    </button>
  );
}

// ❌ سيء
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Tailwind CSS

```tsx
// ✅ جيد - منظم ومقروء
<div className="
  flex items-center gap-4
  rounded-xl border border-white/10
  bg-white/5 p-6
  shadow-lg
  hover:bg-white/10
  transition-all
">

// ❌ سيء - فوضوي
<div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg hover:bg-white/10 transition-all">
```

### التسميات

```typescript
// Components: PascalCase
export function UserProfile() { }

// Functions: camelCase
export function calculateTotal() { }

// Constants: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 1024 * 1024;

// Types/Interfaces: PascalCase
export interface UserData { }
export type UserRole = 'admin' | 'user';

// Files: PascalCase للمكونات، camelCase للباقي
// UserProfile.tsx
// dataParser.ts
```

### البنية

```typescript
// ✅ ترتيب الاستيرادات
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// 3. Internal components
import { Button } from './Button';

// 4. Utilities
import { formatDate } from '../lib/utils';

// 5. Types
import type { User } from '../types';

// 6. Styles
import './styles.css';
```

## 📝 رسائل Commit

نستخدم [Conventional Commits](https://www.conventionalcommits.org/):

### الأنواع

- `feat:` ميزة جديدة
- `fix:` إصلاح خطأ
- `docs:` تغييرات في التوثيق
- `style:` تنسيق الكود (لا يؤثر على المنطق)
- `refactor:` إعادة هيكلة الكود
- `perf:` تحسين الأداء
- `test:` إضافة أو تعديل الاختبارات
- `chore:` مهام صيانة

### الأمثلة

```bash
# ✅ جيد
git commit -m "feat: add smart suggestions to chat"
git commit -m "fix: resolve PDF export issue"
git commit -m "docs: update README with new features"
git commit -m "refactor: simplify data parser logic"
git commit -m "perf: optimize chart rendering"

# ❌ سيء
git commit -m "update"
git commit -m "fixed stuff"
git commit -m "WIP"
```

### Scope (اختياري)

```bash
git commit -m "feat(chat): add suggestion chips"
git commit -m "fix(pdf): handle large files correctly"
git commit -m "docs(readme): add installation guide"
```

## 🧪 اختبار التغييرات

### قبل الـ Commit

```bash
# تحقق من TypeScript
npm run type-check

# تحقق من التنسيق
npm run lint

# ابنِ المشروع
npm run build

# شغل المشروع محلياً
npm run dev
```

### اختبارات يدوية

- [ ] اختبر الميزة في متصفحات مختلفة (Chrome, Firefox, Safari)
- [ ] اختبر على الأجهزة المحمولة
- [ ] تحقق من RTL (اتجاه النص العربي)
- [ ] اختبر مع بيانات كبيرة
- [ ] تحقق من رسائل الخطأ

## 🔍 عملية المراجعة

### ماذا نتوقع من المراجعين؟

- مراجعة الكود خلال 3-5 أيام
- تعليقات بناءة وواضحة
- اقتراحات للتحسين

### ماذا نتوقع من المساهمين؟

- الرد على التعليقات في الوقت المناسب
- إجراء التغييرات المطلوبة
- طرح الأسئلة إذا كان شيء غير واضح

## 📚 موارد مفيدة

### الوثائق الرسمية

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### أدوات

- [Gemini AI Documentation](https://ai.google.dev/)
- [Recharts](https://recharts.org/)
- [React Router](https://reactrouter.com/)

## ❓ أسئلة؟

إذا كان لديك أي أسئلة:

1. راجع [README.md](README.md)
2. ابحث في [Issues](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues)
3. افتح [Issue جديدة](https://github.com/AhmedAlmaghz/Maghaz-ai-analysis/issues/new)

## 🙏 شكراً لك!

مساهماتك تجعل هذا المشروع أفضل للجميع! 💖

---

<div align="center">

**صُنع بـ ❤️ للمجتمع العربي**

</div>
