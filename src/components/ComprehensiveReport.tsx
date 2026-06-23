import { useMemo } from 'react';
import {
  FileText,
  Database,
  Sparkles,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import type { Project } from '../lib/storage';

interface Props {
  project: Project;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function ComprehensiveReport({ project, showHeader = true, showFooter = true }: Props) {
  const reportDate = useMemo(() => {
    return new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const dataStats = useMemo(() => {
    if (!project.data) return null;
    return {
      rows: project.data.rows.length,
      columns: project.data.columns.length,
      numericCols: project.data.columns.filter((c) => c.type === 'numeric').length,
      categoricalCols: project.data.columns.filter((c) => c.type === 'categorical').length,
      dateCols: project.data.columns.filter((c) => c.type === 'date').length,
    };
  }, [project.data]);

  return (
    <div id="comprehensive-report" className="comprehensive-report" dir="rtl">
      {/* Header */}
      {showHeader && (
        <div className="report-header">
          <div className="header-gradient">
            <div className="header-content">
              <div className="logo-section">
                <div className="logo-icon">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="logo-text">
                  <h1 className="logo-title">محلل البيانات الذكي</h1>
                  <p className="logo-subtitle">AI-Powered Data Analytics</p>
                </div>
              </div>
              <div className="report-meta">
                <div className="meta-item">
                  <Calendar className="h-4 w-4" />
                  <span>{reportDate}</span>
                </div>
                <div className="meta-item">
                  <FileText className="h-4 w-4" />
                  <span>تقرير شامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Page */}
      <div className="report-section cover-page">
        <div className="cover-content">
          <h1 className="cover-title">{project.name}</h1>
          {project.description && <p className="cover-description">{project.description}</p>}
          
          <div className="cover-divider" />
          
          <div className="cover-info">
            <div className="info-item">
              <span className="info-label">تاريخ الإنشاء</span>
              <span className="info-value">
                {new Date(project.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">آخر تحديث</span>
              <span className="info-value">
                {new Date(project.updatedAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {project.tags && project.tags.length > 0 && (
              <div className="info-item">
                <span className="info-label">الوسوم</span>
                <div className="tags-container">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="report-section">
        <h2 className="section-title">
          <FileText className="h-6 w-6" />
          جدول المحتويات
        </h2>
        <div className="toc">
          <div className="toc-item">
            <span className="toc-number">1</span>
            <span className="toc-text">نظرة عامة على البيانات</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">2</span>
            <span className="toc-text">الملخص التنفيذي</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">3</span>
            <span className="toc-text">مؤشرات الأداء الرئيسية</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">4</span>
            <span className="toc-text">الرؤى الرئيسية</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">5</span>
            <span className="toc-text">الاتجاهات والتنبؤات</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">6</span>
            <span className="toc-text">التوصيات العملية</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">7</span>
            <span className="toc-text">سجل المحادثة</span>
          </div>
          <div className="toc-item">
            <span className="toc-number">8</span>
            <span className="toc-text">البيانات الخام</span>
          </div>
        </div>
      </div>

      {/* Section 1: Data Overview */}
      {dataStats && (
        <div className="report-section">
          <h2 className="section-title">
            <Database className="h-6 w-6" />
            1. نظرة عامة على البيانات
          </h2>
          
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{dataStats.rows.toLocaleString('ar-SA')}</div>
              <div className="stat-label">عدد الصفوف</div>
            </div>
            <div className="stat-card stat-secondary">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{dataStats.columns}</div>
              <div className="stat-label">عدد الأعمدة</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">🔢</div>
              <div className="stat-value">{dataStats.numericCols}</div>
              <div className="stat-label">أعمدة رقمية</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-icon">🏷️</div>
              <div className="stat-value">{dataStats.categoricalCols}</div>
              <div className="stat-label">أعمدة فئوية</div>
            </div>
          </div>

          <div className="subsection">
            <h3 className="subsection-title">تفاصيل الأعمدة</h3>
            <div className="columns-table">
              <div className="table-header">
                <div className="col-name">اسم العمود</div>
                <div className="col-type">النوع</div>
                <div className="col-unique">القيم الفريدة</div>
                <div className="col-null">القيم الفارغة</div>
              </div>
              {project.data?.columns.map((col, i) => (
                <div key={i} className="table-row">
                  <div className="col-name">{col.name}</div>
                  <div className="col-type">
                    <span className={`type-badge type-${col.type}`}>
                      {col.type === 'numeric'
                        ? 'رقمي'
                        : col.type === 'categorical'
                        ? 'فئوي'
                        : col.type === 'date'
                        ? 'تاريخ'
                        : 'نصي'}
                    </span>
                  </div>
                  <div className="col-unique">{col.uniqueCount.toLocaleString('ar-SA')}</div>
                  <div className="col-null">{col.nullCount.toLocaleString('ar-SA')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Executive Summary */}
      {project.analysis?.summary && (
        <div className="report-section">
          <h2 className="section-title">
            <Sparkles className="h-6 w-6" />
            2. الملخص التنفيذي
          </h2>
          <div className="summary-box">
            <p className="summary-text">{project.analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Section 3: KPIs */}
      {project.analysis?.kpis && project.analysis.kpis.length > 0 && (
        <div className="report-section">
          <h2 className="section-title">
            <BarChart3 className="h-6 w-6" />
            3. مؤشرات الأداء الرئيسية (KPIs)
          </h2>
          <div className="kpis-grid">
            {project.analysis.kpis.map((kpi, i) => (
              <div
                key={i}
                className={`kpi-card kpi-${
                  kpi.sentiment === 'up'
                    ? 'positive'
                    : kpi.sentiment === 'down'
                    ? 'negative'
                    : 'neutral'
                }`}
              >
                <div className="kpi-header">
                  <span className="kpi-label">{kpi.label}</span>
                  {kpi.change && (
                    <span
                      className={`kpi-change ${
                        kpi.sentiment === 'up'
                          ? 'change-positive'
                          : kpi.sentiment === 'down'
                          ? 'change-negative'
                          : 'change-neutral'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  )}
                </div>
                <div className="kpi-value">{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Key Insights */}
      {project.analysis?.insights && project.analysis.insights.length > 0 && (
        <div className="report-section">
          <h2 className="section-title">
            <Sparkles className="h-6 w-6" />
            4. الرؤى الرئيسية
          </h2>
          <div className="insights-list">
            {project.analysis.insights.map((insight, i) => (
              <div key={i} className="insight-item">
                <div className="insight-number">{i + 1}</div>
                <div className="insight-content">{insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Trends and Predictions */}
      {(project.analysis?.trends || project.analysis?.predictions) && (
        <div className="report-section">
          <h2 className="section-title">
            <TrendingUp className="h-6 w-6" />
            5. الاتجاهات والتنبؤات
          </h2>

          {project.analysis?.trends && project.analysis.trends.length > 0 && (
            <div className="subsection">
              <h3 className="subsection-title">الاتجاهات الملحوظة</h3>
              <div className="trends-list">
                {project.analysis.trends.map((trend, i) => (
                  <div key={i} className="trend-item">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.analysis?.predictions && project.analysis.predictions.length > 0 && (
            <div className="subsection">
              <h3 className="subsection-title">التنبؤات المستقبلية</h3>
              <div className="predictions-list">
                {project.analysis.predictions.map((prediction, i) => (
                  <div key={i} className="prediction-item">
                    <Target className="h-5 w-5 text-indigo-500" />
                    <span>{prediction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 6: Recommendations */}
      {project.analysis?.recommendations && project.analysis.recommendations.length > 0 && (
        <div className="report-section">
          <h2 className="section-title">
            <CheckCircle2 className="h-6 w-6" />
            6. التوصيات العملية
          </h2>
          <div className="recommendations-list">
            {project.analysis.recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item">
                <div className="rec-number">{i + 1}</div>
                <div className="rec-content">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 7: Chat History with Visualizations */}
      {project.chatHistory && project.chatHistory.length > 0 && (
        <div className="report-section">
          <h2 className="section-title">
            <MessageSquare className="h-6 w-6" />
            7. سجل المحادثة والتصورات
          </h2>
          <div className="chat-summary">
            <div className="summary-stat">
              <span className="stat-label">إجمالي الرسائل</span>
              <span className="stat-value">{project.chatHistory.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">رسائل المستخدم</span>
              <span className="stat-value">
                {project.chatHistory.filter((m) => m.role === 'user').length}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">ردود المساعد</span>
              <span className="stat-value">
                {project.chatHistory.filter((m) => m.role === 'assistant').length}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">التصورات</span>
              <span className="stat-value">
                {project.chatHistory.filter((m) => m.visualizations && m.visualizations.length > 0).length}
              </span>
            </div>
          </div>

          <div className="chat-history-with-charts">
            {project.chatHistory.map((msg, i) => (
              <div key={i} className={`chat-message-full ${msg.role}`}>
                <div className="message-header">
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <span className="message-role">
                    {msg.role === 'user' ? 'المستخدم' : 'المساعد'}
                  </span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="message-content">{msg.text}</div>
                
                {/* عرض التصورات إذا وجدت */}
                {msg.visualizations && msg.visualizations.length > 0 && (
                  <div className="message-visualizations">
                    <div className="visualizations-header">
                      <BarChart3 className="h-4 w-4" />
                      <span>التصورات البيانية ({msg.visualizations.length})</span>
                    </div>
                    <div className="visualizations-grid">
                      {msg.visualizations.map((viz, vizIndex) => (
                        <div key={vizIndex} className="visualization-card">
                          <div className="viz-header">
                            <span className="viz-title">{viz.title}</span>
                            <span className="viz-type">{viz.type}</span>
                          </div>
                          {viz.subtitle && (
                            <div className="viz-subtitle">{viz.subtitle}</div>
                          )}
                          <div className="viz-info">
                            {viz.categoryColumn && (
                              <div className="viz-detail">
                                <strong>الفئة:</strong> {viz.categoryColumn}
                              </div>
                            )}
                            {viz.numericColumn && (
                              <div className="viz-detail">
                                <strong>القيمة:</strong> {viz.numericColumn}
                              </div>
                            )}
                            {viz.aggregation && (
                              <div className="viz-detail">
                                <strong>التجميع:</strong> {viz.aggregation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 8: Raw Data Sample */}
      {project.data && project.data.rows.length > 0 && (
        <div className="report-section">
          <h2 className="section-title">
            <Database className="h-6 w-6" />
            8. عينة من البيانات الخام
          </h2>
          <p className="section-note">
            عرض أول 10 صفوف من أصل {project.data.rows.length.toLocaleString('ar-SA')} صف
          </p>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-number">#</th>
                  {project.data.headers.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.data.rows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td className="row-number">{i + 1}</td>
                    {project.data!.headers.map((header, j) => (
                      <td key={j}>
                        {row[header] !== null && row[header] !== undefined
                          ? String(row[header])
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div className="report-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <Sparkles className="h-5 w-5" />
              <span>تم إنشاء هذا التقرير بواسطة محلل البيانات الذكي</span>
            </div>
            <div className="footer-date">{reportDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}
