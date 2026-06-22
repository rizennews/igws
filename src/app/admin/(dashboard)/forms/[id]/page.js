import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Eye, Target, MousePointer2 } from 'lucide-react';
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
  
  const reachedStep1 = dropoffStats['step_0'] || 0; // step_0 is the first time they click Next

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 rounded-full hover:bg-black/5 text-muted transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-[20px] font-extrabold text-navy">{form.title}</h2>
          <p className="text-[13px] text-muted mt-0.5">/f/{form.slug}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-7">
        <div className="bg-white border border-custom-border rounded-xl p-4.5 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1.5 flex items-center gap-1.5">
            <Eye size={14} /> Total Views
          </div>
          <div className="text-[28px] font-extrabold text-navy">{views}</div>
        </div>
        <div className="bg-white border border-custom-border rounded-xl p-4.5 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1.5 flex items-center gap-1.5">
            <MousePointer2 size={14} /> Started Form
          </div>
          <div className="text-[28px] font-extrabold text-navy">{reachedStep1}</div>
        </div>
        <div className="bg-white border border-custom-border rounded-xl p-4.5 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1.5 flex items-center gap-1.5">
            <Users size={14} /> Total Submissions
          </div>
          <div className="text-[28px] font-extrabold text-purple">{numSubmissions}</div>
        </div>
        <div className="bg-white border border-custom-border rounded-xl p-4.5 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1.5 flex items-center gap-1.5">
            <Target size={14} /> Conversion Rate
          </div>
          <div className="text-[28px] font-extrabold text-success">{conversionRate}%</div>
        </div>
      </div>

      <div className="bg-white border border-custom-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-custom-border flex justify-between items-center bg-off-white">
          <h3 className="text-[14px] font-bold text-navy">Registration Data</h3>
          <ExportCSVButton submissions={submissions} columns={columns} title={form.title} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[900px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">
                  Date
                </th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center p-12 text-muted">
                    No submissions received yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-custom-border hover:bg-purple/5">
                    <td className="p-3 text-custom-text whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    {columns.map((col, idx) => {
                      const val = sub.data[col];
                      const isFile = val && typeof val === 'object' && val.url;
                      return (
                        <td key={idx} className="p-3 text-custom-text max-w-[200px] truncate">
                          {isFile ? (
                            <a href={val.url} target="_blank" rel="noreferrer" className="text-purple underline font-semibold hover:text-navy">
                              View File
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
