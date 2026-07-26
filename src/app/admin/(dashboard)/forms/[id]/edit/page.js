import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormEditor from './FormEditor';

export default async function EditFormPage({ params }) {
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
  } catch (dbErr) {
    console.error('Database connection error on edit form page:', dbErr);
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

  // Parse the schema robustly
  let initialSchema = [];
  try {
    initialSchema = typeof form.schema === 'string' ? JSON.parse(form.schema) : form.schema;
  } catch (err) {
    console.error('Failed to parse schema', err);
  }

  return (
    <FormEditor 
      formId={form.id}
      initialTitle={form.title}
      initialDescription={form.description}
      initialSlug={form.slug}
      initialSchema={initialSchema}
      initialIsActive={form.isActive}
      initialEndDate={form.endDate ? form.endDate.toISOString().split('T')[0] : ''}
      initialOgImage={form.ogImage || ''}
      initialClosedMessage={form.closedMessage || ''}
      initialViews={form.views || 0}
      initialSubmissions={form.submissions.map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        data: JSON.parse(s.data)
      }))}
    />
  );
}
