import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Eye, Target, MousePointer2, FileText, Download } from 'lucide-react';
import ExportCSVButton from './ExportCSVButton';

export default async function FormSubmissionsPage({ params }) {
  const { id } = await params;

  let form = null;
  try {
    form = await prisma.form.findUnique({
      where: { id },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load form details:', err);
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-[#E4E8F6]">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy mb-2">Temporary Connection Issue</h1>
          <p className="text-muted text-sm leading-relaxed mb-6">
            We are having trouble connecting to the database server. This is usually transient. Please reload the page to reconnect.
          </p>
          <a href="" className="inline-flex px-6 py-2 bg-navy text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
            Reload Page
          </a>
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }

  const schema = JSON.parse(form.schema);
  const submissions = form.submissions.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    data: JSON.parse(s.data)
  }));

  // We find columns dynamically based on schema labels
  const columns = schema.map(f => f.label);

  const views = form.views || 0;
  const numSubmissions = submissions.length;
  const conversionRate = views > 0 ? Math.round((numSubmissions / views) * 100) : 0;
  
  // Calculate Drop-off metrics
  let dropoffStats = {};
  try {
    if (form.dropoffStats) {
      dropoffStats = JSON.parse(form.dropoffStats);
    }
  } catch (e) {}
  
  const reachedStep1 = dropoffStats['step_0'] || 0;

  return (
    <div className="max-w-[1100px] w-full mx-auto p-7 space-y-8 font-sans">
      
      {/* Back & Header */}
      <div className="flex items-center gap-3.5 border-b border-[#E4E8F6] pb-6">
        <Link href="/admin" className="p-2.5 rounded-full hover:bg-navy/5 text-navy border border-[#E4E8F6] transition-colors bg-white shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-[26px] font-bold text-navy tracking-tight">{form.title}</h2>
          <Link href={`/f/${form.slug}`} target="_blank" className="text-[13px] font-semibold text-purple hover:underline mt-0.5 inline-block">
            /f/{form.slug}
          </Link>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E4E8F6] rounded-[20px] p-6 shadow-sm">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-2 flex items-center gap-1.5">
            <Eye size={13} className="text-navy" /> Total Views
          </div>
          <div className="text-[30px] font-bold text-navy">{views}</div>
        </div>
        <div className="bg-white border border-[#E4E8F6] rounded-[20px] p-6 shadow-sm">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-2 flex items-center gap-1.5">
            <MousePointer2 size={13} className="text-navy" /> Started Form
          </div>
          <div className="text-[30px] font-bold text-navy">{reachedStep1}</div>
        </div>
        <div className="bg-white border border-[#E4E8F6] rounded-[20px] p-6 shadow-sm">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-2 flex items-center gap-1.5">
            <Users size={13} className="text-purple" /> Submissions
          </div>
          <div className="text-[30px] font-bold text-purple">{numSubmissions}</div>
        </div>
        <div className="bg-white border border-[#E4E8F6] rounded-[20px] p-6 shadow-sm">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-2 flex items-center gap-1.5">
            <Target size={13} className="text-[#28A745]" /> Conversion Rate
          </div>
          <div className="text-[30px] font-bold text-[#28A745]">{conversionRate}%</div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white border border-[#E4E8F6] rounded-[24px] overflow-hidden shadow-sm">
        
        {/* Table Controls */}
        <div className="px-6 py-4.5 border-b border-[#E4E8F6] flex justify-between items-center bg-[#FBFBFC]">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-navy" />
            <h3 className="text-[14px] font-bold text-navy uppercase tracking-wider">Submissions Log</h3>
          </div>
          {submissions.length > 0 && (
            <ExportCSVButton submissions={submissions} columns={columns} title={form.title} />
          )}
        </div>
        
        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[900px]">
            <thead>
              <tr className="bg-[#F8F9FA]">
                <th className="py-4 px-5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-[#E4E8F6] whitespace-nowrap">
                  Date & Time
                </th>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-4 px-5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-[#E4E8F6] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F6]">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-20 px-6 text-muted">
                    <div className="flex justify-center mb-3 opacity-30">
                      <FileText size={40} />
                    </div>
                    <p className="text-[14px]">No submissions recorded yet for this form flow.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-purple/5 transition-colors">
                    <td className="py-4 px-5 text-custom-text whitespace-nowrap font-medium">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    {columns.map((col, idx) => {
                      const val = sub.data[col];
                      const isFile = val && typeof val === 'object' && val.url;
                      return (
                        <td key={idx} className="py-4 px-5 text-custom-text max-w-[240px] truncate">
                          {isFile ? (
                            <a href={val.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-purple underline font-semibold hover:text-[#7C3DB5]">
                              View Attachment
                            </a>
                          ) : (
                            <span title={String(val || '—')}>{String(val || '—')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
