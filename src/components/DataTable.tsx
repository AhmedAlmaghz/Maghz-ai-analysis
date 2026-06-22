import { Database, Hash, Type, Calendar, Tag } from 'lucide-react';
import type { ParsedData } from '../lib/dataParser';

interface Props {
  data: ParsedData;
}

export function DataTable({ data }: Props) {
  const typeIcon = (type: string) => {
    switch (type) {
      case 'numeric':
        return <Hash className="h-3 w-3" />;
      case 'categorical':
        return <Tag className="h-3 w-3" />;
      case 'date':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Type className="h-3 w-3" />;
    }
  };
  
  const typeColor = (type: string) => {
    switch (type) {
      case 'numeric':
        return 'bg-blue-100 text-blue-700';
      case 'categorical':
        return 'bg-purple-100 text-purple-700';
      case 'date':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };
  
  return (
    <div className="glass rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      <div className="border-b border-white/20 bg-gradient-to-r from-slate-50 to-slate-100/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">معاينة البيانات</h3>
            <p className="text-sm text-slate-500">
              {data.rows.length} صف • {data.columns.length} عمود
            </p>
          </div>
        </div>
      </div>
      
      {/* Column Metadata */}
      <div className="border-b border-slate-100 bg-white/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          تفاصيل الأعمدة
        </p>
        <div className="flex flex-wrap gap-2">
          {data.columns.map((col) => (
            <div
              key={col.name}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${typeColor(
                col.type
              )}`}
            >
              {typeIcon(col.type)}
              <span>{col.name}</span>
              <span className="opacity-60">({col.uniqueCount})</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Table */}
      <div className="max-h-96 overflow-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900 text-white shadow-md">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold">#</th>
              {data.headers.map((header) => (
                <th key={header} className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.slice(0, 100).map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-indigo-50/30">
                <td className="px-4 py-2.5 text-xs text-slate-400">{i + 1}</td>
                {data.headers.map((header) => (
                  <td key={header} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                    {row[header] !== null && row[header] !== undefined ? String(row[header]) : <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.rows.length > 100 && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">
          يتم عرض أول 100 صف من {data.rows.length}
        </div>
      )}
    </div>
  );
}
