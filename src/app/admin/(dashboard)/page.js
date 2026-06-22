import Link from 'next/link';
import { prisma } from '@/lib/db';
import { PlusCircle, Search, FileText, ArrowRight } from 'lucide-react';

export default async function AdminDashboard() {
  let forms = [];
  try {
    forms = await prisma.form.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });
  } catch (error) {
    console.error('Failed to load forms from db. Ensure DB is connected.');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-navy">Forms Dashboard</h2>
          <p className="text-[13px] text-muted mt-0.5">iGenius Kids World</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
        <div className="bg-white border border-custom-border rounded-xl p-4.5">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1.5">Total Forms</div>
          <div className="text-[28px] font-extrabold text-navy">{forms.length}</div>
        </div>
      </div>

      <div className="bg-white border border-custom-border rounded-xl overflow-auto">
        <table className="w-full text-[13px] min-w-[700px]">
          <thead>
            <tr>
              <th className="p-3.5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">Form Title</th>
              <th className="p-3.5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">Link / Slug</th>
              <th className="p-3.5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">Created</th>
              <th className="p-3.5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">Submissions</th>
              <th className="p-3.5 text-left text-[11px] font-bold tracking-[0.08em] uppercase text-muted border-b border-custom-border bg-light-gray whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-16 text-muted">
                  <div className="flex justify-center mb-3 opacity-30">
                    <FileText size={48} />
                  </div>
                  <p className="text-[14px]">No forms created yet.</p>
                  <Link href="/admin/forms/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-navy text-white rounded-lg text-[13px] font-semibold hover:opacity-90">
                    <PlusCircle size={16} /> Create First Form
                  </Link>
                </td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form.id} className="border-b border-custom-border last:border-b-0 hover:bg-purple/5">
                  <td className="p-3.5 text-custom-text font-bold align-middle">{form.title}</td>
                  <td className="p-3.5 align-middle">
                    <Link href={`/f/${form.slug}`} target="_blank" className="font-bold text-purple text-[12px] hover:underline">
                      /f/{form.slug}
                    </Link>
                  </td>
                  <td className="p-3.5 text-custom-text align-middle">{new Date(form.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-custom-text align-middle">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F4FD] text-[#1A7AB5]">
                      {form._count?.submissions || 0}
                    </span>
                  </td>
                  <td className="p-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/forms/${form.id}`} className="px-3 py-1.5 bg-purple/10 text-purple border-none rounded-md font-jost text-[12px] font-semibold cursor-pointer transition-colors hover:bg-purple hover:text-white inline-flex items-center gap-1.5">
                        View <ArrowRight size={14} />
                      </Link>
                      <Link href={`/admin/forms/${form.id}/edit`} className="px-3 py-1.5 bg-navy/10 text-navy border-none rounded-md font-jost text-[12px] font-semibold cursor-pointer transition-colors hover:bg-navy hover:text-white inline-flex items-center gap-1.5">
                        Edit
                      </Link>
                      <form action={async () => {
                        'use server';
                        const { deleteForm } = await import('./actions');
                        await deleteForm(form.id);
                      }}>
                        <button type="submit" className="px-3 py-1.5 bg-error/10 text-error border-none rounded-md font-jost text-[12px] font-semibold cursor-pointer transition-colors hover:bg-error hover:text-white inline-flex items-center gap-1.5">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
