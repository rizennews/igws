import Link from 'next/link';
import { prisma } from '@/lib/db';
import { PlusCircle, FileText, ArrowRight, ExternalLink, Edit2, Trash2, Calendar, Eye, Inbox, TrendingUp } from 'lucide-react';
import DeleteFormButton from './DeleteFormButton';

export const dynamic = 'force-dynamic';

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

  const totalSubmissions = forms.reduce((acc, curr) => acc + (curr._count?.submissions || 0), 0);
  const totalViews = forms.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const averageConversion = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  return (
    <div className="max-w-[1100px] w-full mx-auto p-6 md:p-8 space-y-10 font-sans">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#EDEEF8] pb-8">
        <div>
          <h2 className="text-[32px] font-bold text-navy tracking-tight font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
            Forms Workspace
          </h2>
          <p className="text-[14px] text-muted mt-1.5 font-medium">Create, publish, and track Conversational form completions from a single dashboard.</p>
        </div>
        <Link 
          href="/admin/forms/new" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple hover:bg-purple-mid text-white rounded-full text-[13px] font-bold transition-all hover:shadow-md active:scale-95 shadow-sm"
        >
          <PlusCircle size={16} /> New Form Flow
        </Link>
      </div>

      {/* Bento Telemetry Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Flows */}
        <div className="bg-[#F8F9FD] border border-[#EDEEF8] rounded-[24px] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted block">Active Flows</span>
            <div className="text-[36px] font-bold text-navy leading-none font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
              {forms.length}
            </div>
            <p className="text-[11px] text-[#A0A4CD] font-semibold">Configured templates</p>
          </div>
          <div className="p-3.5 bg-purple/10 text-purple rounded-2xl shrink-0 z-10">
            <FileText size={20} />
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-[#FBFBFC] border border-[#EDEEF8] rounded-[24px] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted block">Submissions</span>
            <div className="text-[36px] font-bold text-[#28A745] leading-none font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
              {totalSubmissions}
            </div>
            <p className="text-[11px] text-[#A0A4CD] font-semibold">Total responses logged</p>
          </div>
          <div className="p-3.5 bg-[#28A745]/10 text-[#28A745] rounded-2xl shrink-0 z-10">
            <Inbox size={20} />
          </div>
        </div>

        {/* Avg Conversion */}
        <div className="bg-[#F8F9FD] border border-[#EDEEF8] rounded-[24px] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted block">Avg Conversion</span>
            <div className="text-[36px] font-bold text-navy leading-none font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
              {averageConversion}%
            </div>
            <p className="text-[11px] text-[#A0A4CD] font-semibold">Based on {totalViews} views</p>
          </div>
          <div className="p-3.5 bg-[#F5C842]/10 text-[#C19B18] rounded-2xl shrink-0 z-10">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Forms Workspace Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[12px] font-bold text-navy uppercase tracking-wider">Your Form Flows</h3>
          <span className="px-2 py-0.5 rounded bg-navy/5 text-navy text-[10px] font-bold">{forms.length}</span>
        </div>
        
        {forms.length === 0 ? (
          <div className="bg-white border border-[#EDEEF8] rounded-[32px] text-center p-16 text-muted shadow-sm max-w-xl mx-auto">
            <div className="w-14 h-14 bg-purple/10 rounded-full flex items-center justify-center text-purple mx-auto mb-5 shadow-sm">
              <PlusCircle size={28} />
            </div>
            <h4 className="text-[18px] font-bold text-navy mb-1.5 font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>No form flows exist yet</h4>
            <p className="text-[13px] text-muted max-w-[320px] mx-auto mb-6 leading-relaxed">Create a conversational flow to start collecting submissions.</p>
            <Link 
              href="/admin/forms/new" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white rounded-full text-[12px] font-bold hover:bg-purple-mid transition-all shadow-sm"
            >
              + Create First Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => {
              const currentSubCount = form._count?.submissions || 0;
              const currentConvRate = form.views > 0 ? Math.round((currentSubCount / form.views) * 100) : 0;
              
              return (
                <div 
                  key={form.id} 
                  className="bg-white border border-[#EDEEF8] rounded-[28px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-purple/35 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Badge & Meta */}
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${form.isActive ? 'bg-[#28A745]/10 text-[#28A745]' : 'bg-[#6B6E8A]/10 text-[#6B6E8A]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-[#28A745]' : 'bg-[#6B6E8A]'}`}></span>
                        {form.isActive ? 'Active' : 'Closed'}
                      </span>
                      <span className="text-muted/75">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title & Link */}
                    <div className="space-y-1.5">
                      <h4 className="text-[19px] font-bold text-navy tracking-tight leading-snug line-clamp-1 group-hover:text-purple transition-colors font-serif" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                        {form.title}
                      </h4>
                      <Link 
                        href={`/f/${form.slug}`} 
                        target="_blank" 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple/75 hover:text-purple bg-purple/5 px-2.5 py-1 rounded-full transition-colors"
                      >
                        /f/{form.slug} <ExternalLink size={10} />
                      </Link>
                    </div>

                    {/* Telemetry Stats Inside Card */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-semibold border-t border-[#EDEEF8]">
                      <div>
                        <span className="text-muted block text-[9px] uppercase tracking-wider mb-px">Responses</span>
                        <span className="text-navy font-bold">{currentSubCount} submissions</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[9px] uppercase tracking-wider mb-px">Conversion</span>
                        <span className="text-navy font-bold">{currentConvRate}% rate</span>
                      </div>
                    </div>
                  </div>

                  {/* Card CTA Actions */}
                  <div className="flex items-center justify-between border-t border-[#EDEEF8] pt-4.5 mt-6 gap-3">
                    <div className="flex gap-2">
                      <Link 
                        href={`/admin/forms/${form.id}/edit`} 
                        className="p-2 rounded-full bg-light-gray text-navy hover:bg-purple hover:text-white transition-all shadow-sm" 
                        title="Edit Form Layout"
                      >
                        <Edit2 size={13} strokeWidth={2.5} />
                      </Link>
                      
                      <DeleteFormButton 
                        formId={form.id} 
                        deleteAction={async (id) => {
                          'use server';
                          const { deleteForm } = await import('./actions');
                          await deleteForm(id);
                        }} 
                      />
                    </div>

                    <Link 
                      href={`/admin/forms/${form.id}`} 
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-[12px] font-bold bg-[#EDEEF8]/60 text-navy hover:bg-purple hover:text-white hover:shadow-sm transition-all"
                    >
                      Results <ArrowRight size={13} strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
