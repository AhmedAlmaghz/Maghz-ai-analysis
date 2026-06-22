import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Project } from './storage';
import type { ParsedData } from './dataParser';

// Export project as JSON
export function exportAsJSON(project: Project): void {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export data as CSV
export function exportDataAsCSV(data: ParsedData): void {
  if (!data.rows.length) return;
  
  const headers = data.headers.join(',');
  const rows = data.rows.map((row) =>
    data.headers
      .map((h) => {
        const val = row[h];
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export chat history as text
export function exportChatAsText(project: Project): void {
  let text = `# ${project.name}\n\n`;
  text += `تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}\n\n`;
  text += `${'='.repeat(50)}\n\n`;
  
  project.chatHistory.forEach((msg) => {
    const sender = msg.role === 'user' ? '👤 المستخدم' : '🤖 المساعد';
    const time = new Date(msg.timestamp).toLocaleString('ar-SA');
    text += `[${time}] ${sender}:\n`;
    text += `${msg.text}\n\n`;
  });
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${project.name}-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export analysis as PDF using print-friendly approach
export async function exportAsPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('العنصر غير موجود');
  }
  
  // Try html2canvas approach first with improved settings
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      ignoreElements: (el) => {
        // Skip buttons and inputs
        return el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
      },
      onclone: (doc) => {
        // Ensure proper font rendering
        const style = doc.createElement('style');
        style.textContent = `
          * {
            font-family: 'Cairo', 'Tajawal', Arial, sans-serif !important;
          }
        `;
        doc.head.appendChild(style);
      },
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let position = 0;
    let pageNumber = 1;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    position -= pageHeight;
    
    // Add additional pages if content overflows
    while (position > -imgHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      position -= pageHeight;
      pageNumber++;
    }
    
    // Add page numbers
    for (let i = 1; i <= pageNumber; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`${i} / ${pageNumber}`, pdfWidth - 20, pageHeight - 10);
    }
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    // Fallback to print method
    console.warn('html2canvas failed, using print fallback:', error);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة');
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { font-family: 'Cairo', sans-serif; }
            body { padding: 20px; background: white; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 20px;">${filename}</h1>
          ${element.innerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

// Export chart as image
export async function exportElementAsImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
  
  const dataUrl = canvas.toDataURL(`image/${format}`);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.${format}`;
  a.click();
}

// Import project from JSON
export async function importProjectFromJSON(file: File): Promise<Project | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;
        // Generate new ID and timestamps
        const imported: Project = {
          ...project,
          id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
