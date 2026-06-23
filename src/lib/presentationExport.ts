import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Project } from './storage';

/**
 * تحويل ألوان oklch إلى hex/rgb لدعم html2canvas
 */
function sanitizeColorsForExport(element: HTMLElement): () => void {
  const original: { el: HTMLElement; prop: string; value: string }[] = [];
  
  const convertOklch = (value: string): string => {
    // استبدال oklch بألوان hex آمنة
    return value.replace(/oklch\([^)]+\)/gi, '#6366f1');
  };
  
  const walk = (el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    const propsToCheck = [
      'color', 'background-color', 'border-color',
      'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
      'outline-color', 'text-decoration-color', 'box-shadow',
    ];
    
    propsToCheck.forEach((prop) => {
      const val = computed.getPropertyValue(prop);
      if (val && val.includes('oklch')) {
        original.push({ el, prop, value: el.style.getPropertyValue(prop) });
        el.style.setProperty(prop, convertOklch(val));
      }
    });
    
    // تحويل CSS variables التي تحتوي oklch
    const bg = computed.getPropertyValue('background');
    if (bg && bg.includes('oklch')) {
      original.push({ el, prop: 'background', value: el.style.background });
      el.style.background = convertOklch(bg);
    }
    
    for (let i = 0; i < el.children.length; i++) {
      if (el.children[i] instanceof HTMLElement) {
        walk(el.children[i] as HTMLElement);
      }
    }
  };
  
  walk(element);
  
  // إرجاع دالة الاستعادة
  return () => {
    original.forEach(({ el, prop, value }) => {
      if (value) {
        el.style.setProperty(prop, value);
      } else {
        el.style.removeProperty(prop);
      }
    });
  };
}

/**
 * تصدير التقرير الشامل كملف PDF
 */
export async function exportComprehensiveReportAsPDF(project: Project): Promise<void> {
  const reportElement = document.getElementById('comprehensive-report');
  if (!reportElement) {
    throw new Error('لم يتم العثور على عنصر التقرير');
  }

  // تحويل ألوان oklch قبل التصدير
  const restoreColors = sanitizeColorsForExport(reportElement);

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 900,
      allowTaint: true,
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        // إزالة oklch من النسخة المستنسخة أيضاً
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            const cssText = htmlEl.style.cssText;
            if (cssText && cssText.includes('oklch')) {
              htmlEl.style.cssText = cssText.replace(/oklch\([^)]+\)/gi, '#6366f1');
            }
          }
        });
        
        // إزالة oklch من جميع stylesheets في النسخة
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((style) => {
          if (style.textContent && style.textContent.includes('oklch')) {
            style.textContent = style.textContent.replace(/oklch\([^)]+\)/gi, '#6366f1');
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let position = 0;
    let pageNumber = 1;

    while (position < imgHeight) {
      if (pageNumber > 1) pdf.addPage();
      
      pdf.addImage(imgData, 'PNG', 0, -position, pageWidth, imgHeight);

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

      position += pageHeight;
      pageNumber++;
    }

    pdf.save(`${project.name}-report.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(`فشل تصدير PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  } finally {
    // استعادة الألوان الأصلية دائماً
    restoreColors();
  }
}

/**
 * تصدير التقرير الشامل كملف DOCX (Word)
 */
export async function exportComprehensiveReportAsDOCX(project: Project): Promise<void> {
  // الحصول على عنصر التقرير
  const reportElement = document.getElementById('comprehensive-report');
  if (!reportElement) {
    throw new Error('لم يتم العثور على عنصر التقرير');
  }

  try {
    // الحصول على CSS
    const styles = document.querySelector('style')?.textContent || '';
    
    // إنشاء HTML مبسط للتقرير
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${project.name} - تقرير شامل</title>
  <style>
    body {
      font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 2rem;
      direction: rtl;
    }
    h1 { color: #6366f1; font-size: 2rem; }
    h2 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 0.5rem; margin-top: 2rem; }
    h3 { color: #374151; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: right; }
    th { background: #6366f1; color: white; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .stat-card { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; text-align: center; }
    .kpi-card { background: #ecfdf5; padding: 1rem; border-radius: 0.5rem; margin: 0.5rem 0; }
    .report-section { margin-bottom: 2rem; }
    .section-title { color: #6366f1; font-size: 1.5rem; border-bottom: 2px solid #6366f1; padding-bottom: 0.5rem; }
    ${styles}
  </style>
</head>
<body>
  ${reportElement.innerHTML}
</body>
</html>`;

    // تحويل إلى Blob وتحميل
    const blob = new Blob(['\ufeff', htmlContent], { 
      type: 'application/msword;charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}-تقرير-شامل.doc`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('DOCX Export Error:', error);
    throw new Error(`فشل تصدير Word: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * تصدير التقرير الشامل كصفحة HTML
 */
export function exportComprehensiveReportAsHTML(project: Project): void {
  const reportElement = document.getElementById('comprehensive-report');
  if (!reportElement) {
    throw new Error('لم يتم العثور على عنصر التقرير');
  }

  try {
    // الحصول على CSS
    const styles = document.querySelector('style')?.textContent || '';
    
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - تقرير شامل</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
      direction: rtl;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      padding: 2rem;
    }
    
    ${styles}
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${reportElement.innerHTML}
  </div>
  
  <script>
    // إضافة تأثيرات تفاعلية
    document.querySelectorAll('.stat-card, .kpi-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.transition = 'transform 0.2s';
      });
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  </script>
</body>
</html>`;

    const blob = new Blob(['\ufeff', htmlContent], { 
      type: 'text/html;charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}-تقرير-شامل.html`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('HTML Export Error:', error);
    throw new Error(`فشل تصدير HTML: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * تصدير التحليلات كعرض تقديمي PowerPoint
 */
export async function exportAsPowerPoint(project: Project): Promise<void> {
  const pptx = new PptxGenJS();
  
  // إعدادات العرض
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = project.name;
  pptx.author = 'AI Data Analyzer';
  pptx.subject = 'تحليل البيانات';
  
  // تفعيل دعم RTL للعربية
  pptx.rtlMode = true;
  
  // الألوان الرئيسية
  const colors = {
    primary: '6366F1',
    secondary: 'A855F7',
    accent: 'EC4899',
    success: '10B981',
    warning: 'F59E0B',
    dark: '1F2937',
    light: 'F9FAFB',
  };
  
  // ===== الشريحة 1: العنوان =====
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: colors.primary };
  
  titleSlide.addText(project.name, {
    x: 0.5,
    y: 2.5,
    w: 12,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  
  titleSlide.addText(project.description || 'تحليل البيانات بالذكاء الاصطناعي', {
    x: 0.5,
    y: 3.8,
    w: 12,
    h: 0.5,
    fontSize: 20,
    color: 'E0E7FF',
    align: 'center',
  });
  
  titleSlide.addText(new Date().toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), {
    x: 0.5,
    y: 4.5,
    w: 12,
    h: 0.4,
    fontSize: 16,
    color: 'C7D2FE',
    align: 'center',
  });
  
  // ===== الشريحة 2: نظرة عامة =====
  if (project.data) {
    const overviewSlide = pptx.addSlide();
    overviewSlide.background = { color: colors.light };
    
    overviewSlide.addText('نظرة عامة على البيانات', {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: colors.dark,
    });
    
    // إحصائيات البيانات
    const stats = [
      { label: 'عدد الصفوف', value: project.data.rows.length.toLocaleString('ar-SA'), color: colors.primary },
      { label: 'عدد الأعمدة', value: project.data.columns.length.toString(), color: colors.secondary },
      { label: 'أعمدة رقمية', value: project.data.columns.filter(c => c.type === 'numeric').length.toString(), color: colors.success },
      { label: 'أعمدة فئوية', value: project.data.columns.filter(c => c.type === 'categorical').length.toString(), color: colors.warning },
    ];
    
    stats.forEach((stat, i) => {
      const x = 0.5 + (i * 3);
      const y = 1.5;
      
      overviewSlide.addShape('rect', {
        x,
        y,
        w: 2.7,
        h: 1.5,
        fill: { color: stat.color },
        rectRadius: 0.1,
      });
      
      overviewSlide.addText(stat.value, {
        x,
        y: y + 0.3,
        w: 2.7,
        h: 0.6,
        fontSize: 36,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
      
      overviewSlide.addText(stat.label, {
        x,
        y: y + 0.9,
        w: 2.7,
        h: 0.4,
        fontSize: 14,
        color: 'FFFFFF',
        align: 'center',
      });
    });
  }
  
  // ===== الشريحة 3: الملخص التنفيذي =====
  if (project.analysis?.summary) {
    const summarySlide = pptx.addSlide();
    summarySlide.background = { color: colors.light };
    
    summarySlide.addText('الملخص التنفيذي', {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: colors.dark,
    });
    
    summarySlide.addText(project.analysis.summary, {
      x: 0.8,
      y: 1.5,
      w: 11.4,
      h: 4.4,
      fontSize: 16,
      color: colors.dark,
      valign: 'top',
      lineSpacing: 28,
    });
  }
  
  // ===== الشريحة 4: مؤشرات الأداء الرئيسية =====
  if (project.analysis?.kpis && project.analysis.kpis.length > 0) {
    const kpiSlide = pptx.addSlide();
    kpiSlide.background = { color: colors.light };
    
    kpiSlide.addText('مؤشرات الأداء الرئيسية (KPIs)', {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: colors.dark,
    });
    
    const kpiColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.accent];
    
    project.analysis.kpis.forEach((kpi, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = 0.5 + (col * 4);
      const y = 1.2 + (row * 2.2);
      
      kpiSlide.addShape('rect', {
        x,
        y,
        w: 3.7,
        h: 1.8,
        fill: { color: kpiColors[i % kpiColors.length] },
        rectRadius: 0.1,
      });
      
      kpiSlide.addText(kpi.value, {
        x,
        y: y + 0.2,
        w: 3.7,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
      
      kpiSlide.addText(kpi.label, {
        x,
        y: y + 0.9,
        w: 3.7,
        h: 0.5,
        fontSize: 14,
        color: 'FFFFFF',
        align: 'center',
      });
    });
  }
  
  // ===== الشريحة 5: الرؤى الرئيسية =====
  if (project.analysis?.insights && project.analysis.insights.length > 0) {
    const insightsSlide = pptx.addSlide();
    insightsSlide.background = { color: colors.light };
    
    insightsSlide.addText('الرؤى الرئيسية', {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: colors.dark,
    });
    
    project.analysis.insights.forEach((insight, i) => {
      const y = 1.2 + (i * 0.9);
      insightsSlide.addText(`${i + 1}. ${insight}`, {
        x: 0.8,
        y,
        w: 11.4,
        h: 0.7,
        fontSize: 14,
        color: colors.dark,
        valign: 'middle',
      });
    });
  }
  
  // ===== الشريحة 6: التوصيات =====
  if (project.analysis?.recommendations && project.analysis.recommendations.length > 0) {
    const recsSlide = pptx.addSlide();
    recsSlide.background = { color: colors.light };
    
    recsSlide.addText('التوصيات العملية', {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: colors.dark,
    });
    
    project.analysis.recommendations.forEach((rec, i) => {
      const y = 1.2 + (i * 0.9);
      recsSlide.addText(`✅ ${rec}`, {
        x: 0.8,
        y,
        w: 11.4,
        h: 0.7,
        fontSize: 14,
        color: colors.dark,
        valign: 'middle',
      });
    });
  }
  
  // ===== الشريحة الأخيرة: الخاتمة =====
  const endSlide = pptx.addSlide();
  endSlide.background = { color: colors.primary };
  
  endSlide.addText('شكراً لاهتمامكم', {
    x: 0.5,
    y: 2.5,
    w: 12,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  
  endSlide.addText('تم إنشاء هذا العرض بواسطة محلل البيانات الذكي', {
    x: 0.5,
    y: 3.8,
    w: 12,
    h: 0.5,
    fontSize: 18,
    color: 'E0E7FF',
    align: 'center',
  });
  
  // حفظ الملف
  await pptx.writeFile({ fileName: `${project.name}-عرض-تقديمي.pptx` });
}

/**
 * تصدير التحليلات كعرض تقديمي PDF (باستخدام HTML to Canvas لدعم العربية)
 */
export async function exportAsPresentationPDF(project: Project): Promise<void> {
  // إنشاء عنصر HTML مؤقت
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1200px';
  container.style.background = 'white';
  container.style.fontFamily = 'Cairo, Tajawal, sans-serif';
  container.style.direction = 'rtl';
  container.style.padding = '40px';
  document.body.appendChild(container);
  
  // بناء محتوى HTML
  let htmlContent = `
    <div style="text-align: center; background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%); color: white; padding: 100px 40px; border-radius: 20px;">
      <h1 style="font-size: 48px; margin: 0;">${project.name}</h1>
      <p style="font-size: 20px; margin-top: 20px; opacity: 0.9;">${project.description || 'تحليل البيانات بالذكاء الاصطناعي'}</p>
      <p style="margin-top: 40px; opacity: 0.8;">${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  `;
  
  // إضافة الملخص التنفيذي
  if (project.analysis?.summary) {
    htmlContent += `
      <div style="page-break-before: always; margin-top: 60px;">
        <h2 style="color: #1F2937; font-size: 32px; margin-bottom: 20px;">الملخص التنفيذي</h2>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; line-height: 1.8;">${project.analysis.summary}</p>
        </div>
      </div>
    `;
  }
  
  // إضافة مؤشرات الأداء
  if (project.analysis?.kpis && project.analysis.kpis.length > 0) {
    htmlContent += `
      <div style="page-break-before: always; margin-top: 60px;">
        <h2 style="color: #1F2937; font-size: 32px; margin-bottom: 20px;">مؤشرات الأداء الرئيسية</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px;">
          ${project.analysis.kpis.map((kpi, i) => `
            <div style="background: linear-gradient(135deg, ${['#6366F1', '#A855F7', '#10B981', '#F59E0B', '#EC4899'][i % 5]} 0%, ${['#A855F7', '#EC4899', '#F59E0B', '#6366F1', '#A855F7'][i % 5]} 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${kpi.value}</div>
              <div style="font-size: 14px;">${kpi.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // إضافة الرؤى
  if (project.analysis?.insights && project.analysis.insights.length > 0) {
    htmlContent += `
      <div style="page-break-before: always; margin-top: 60px;">
        <h2 style="color: #1F2937; font-size: 32px; margin-bottom: 20px;">الرؤى الرئيسية</h2>
        <div style="margin-top: 20px;">
          ${project.analysis.insights.map((insight, i) => `
            <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-right: 4px solid #6366F1;">
              <strong>${i + 1}.</strong> ${insight}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // إضافة التوصيات
  if (project.analysis?.recommendations && project.analysis.recommendations.length > 0) {
    htmlContent += `
      <div style="page-break-before: always; margin-top: 60px;">
        <h2 style="color: #1F2937; font-size: 32px; margin-bottom: 20px;">التوصيات العملية</h2>
        <div style="margin-top: 20px;">
          ${project.analysis.recommendations.map((rec, i) => `
            <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-right: 4px solid #10B981;">
              <strong>✅ ${i + 1}.</strong> ${rec}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // إضافة شريحة الخاتمة
  htmlContent += `
    <div style="page-break-before: always; text-align: center; background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%); color: white; padding: 100px 40px; border-radius: 20px; margin-top: 60px;">
      <h1 style="font-size: 48px; margin: 0;">شكراً لاهتمامكم</h1>
      <p style="font-size: 18px; margin-top: 40px; opacity: 0.9;">تم إنشاء هذا العرض بواسطة محلل البيانات الذكي</p>
    </div>
  `;
  
  container.innerHTML = htmlContent;
  
  // إنشاء PDF من HTML
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  
  const pages = container.querySelectorAll('[style*="page-break-before"]');
  const allSections = [container.firstElementChild, ...Array.from(pages)];
  
  for (let i = 0; i < allSections.length; i++) {
    if (i > 0) pdf.addPage();
    
    const canvas = await html2canvas(allSections[i] as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  }
  
  // إزالة العنصر المؤقت
  document.body.removeChild(container);
  
  // حفظ الملف
  pdf.save(`${project.name}-عرض-تقديمي.pdf`);
}

/**
 * تصدير التحليلات كعرض تقديمي HTML (Reveal.js)
 */
export function exportAsHTMLPresentation(project: Project): void {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - عرض تقديمي</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/theme/white.css">
  <style>
    :root {
      --r-main-font: 'Cairo', 'Tajawal', sans-serif;
      --r-heading-font: 'Cairo', 'Tajawal', sans-serif;
    }
    
    .reveal {
      font-family: 'Cairo', 'Tajawal', sans-serif;
    }
    
    .reveal h1, .reveal h2, .reveal h3 {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      color: #6366F1;
    }
    
    .slide-title {
      background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
      color: white;
    }
    
    .slide-title h1 {
      color: white;
      font-size: 3em;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    
    .kpi-card {
      background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
    }
    
    .kpi-value {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .kpi-label {
      font-size: 1em;
      opacity: 0.9;
    }
    
    .insight-list {
      text-align: right;
      list-style: none;
      padding: 0;
    }
    
    .insight-list li {
      background: white;
      padding: 20px;
      margin: 15px 0;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-right: 4px solid #6366F1;
    }
    
    .recommendation-list li {
      border-right-color: #10B981;
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      
      <!-- الشريحة 1: العنوان -->
      <section class="slide-title">
        <h1>${project.name}</h1>
        <p style="font-size: 1.5em; opacity: 0.9;">${project.description || 'تحليل البيانات بالذكاء الاصطناعي'}</p>
        <p style="margin-top: 40px; opacity: 0.8;">${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </section>
      
      ${project.analysis?.summary ? `
      <!-- الشريحة 2: الملخص التنفيذي -->
      <section>
        <h2>الملخص التنفيذي</h2>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 40px;">
          <p style="font-size: 1.2em; line-height: 1.8; text-align: right;">${project.analysis.summary}</p>
        </div>
      </section>
      ` : ''}
      
      ${project.analysis?.kpis && project.analysis.kpis.length > 0 ? `
      <!-- الشريحة 3: مؤشرات الأداء -->
      <section>
        <h2>مؤشرات الأداء الرئيسية</h2>
        <div class="kpi-grid">
          ${project.analysis.kpis.map((kpi, i) => `
            <div class="kpi-card" style="background: linear-gradient(135deg, ${['#6366F1', '#A855F7', '#10B981', '#F59E0B', '#EC4899'][i % 5]} 0%, ${['#A855F7', '#EC4899', '#F59E0B', '#6366F1', '#A855F7'][i % 5]} 100%);">
              <div class="kpi-value">${kpi.value}</div>
              <div class="kpi-label">${kpi.label}</div>
              ${kpi.change ? `<div style="margin-top: 10px; font-size: 0.9em;">${kpi.change}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}
      
      ${project.analysis?.insights && project.analysis.insights.length > 0 ? `
      <!-- الشريحة 4: الرؤى -->
      <section>
        <h2>الرؤى الرئيسية</h2>
        <ul class="insight-list">
          ${project.analysis.insights.map((insight, i) => `
            <li>
              <strong>${i + 1}.</strong> ${insight}
            </li>
          `).join('')}
        </ul>
      </section>
      ` : ''}
      
      ${project.analysis?.recommendations && project.analysis.recommendations.length > 0 ? `
      <!-- الشريحة 5: التوصيات -->
      <section>
        <h2>التوصيات العملية</h2>
        <ul class="insight-list recommendation-list">
          ${project.analysis.recommendations.map((rec, i) => `
            <li>
              <strong>✅ ${i + 1}.</strong> ${rec}
            </li>
          `).join('')}
        </ul>
      </section>
      ` : ''}
      
      <!-- الشريحة الأخيرة -->
      <section class="slide-title">
        <h1>شكراً لاهتمامكم</h1>
        <p style="font-size: 1.2em; opacity: 0.9; margin-top: 40px;">تم إنشاء هذا العرض بواسطة محلل البيانات الذكي</p>
      </section>
      
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      rtl: true,
      slideNumber: true,
      transition: 'slide',
      backgroundTransition: 'fade',
    });
  </script>
</body>
</html>`;
  
  // تحميل الملف
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name}-عرض-تقديمي.html`;
  a.click();
  URL.revokeObjectURL(url);
}
