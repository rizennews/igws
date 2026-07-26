import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormViewer from './FormViewer';
import CreatorBadge from '@/components/ui/CreatorBadge';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form) return { title: 'Form Not Found' };
    
    // Social platforms require absolute URLs for images. We can dynamically get the host.
    const { headers } = await import('next/headers');
    const headerList = await headers();
    const host = headerList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let imageUrl = form.ogImage;
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }

    return {
      title: form.title || 'Untitled Form',
      description: form.description || 'Please fill out this form.',
      openGraph: {
        title: form.title || 'Untitled Form',
        description: form.description || 'Please fill out this form.',
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: form.title || 'Untitled Form',
        description: form.description || 'Please fill out this form.',
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (e) {
    return { title: 'Form' };
  }
}

export default async function PublicFormPage({ params }) {
  const { slug } = await params;
  
  let form = null;
  try {
    form = await prisma.form.findUnique({
      where: { slug }
    });
  } catch (err) {
    console.error('Database connection error on form page:', err);
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

  const isExpired = form.endDate && new Date() > new Date(form.endDate);

  if (!form.isActive || isExpired) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[24px] shadow-sm max-w-md w-full text-center border border-[#E4E8F6]">
          <div className="w-16 h-16 bg-[#e93d82]/10 text-[#e93d82] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3 font-serif">Form Closed</h1>
          <p className="text-muted text-[13px] leading-relaxed whitespace-pre-wrap">
            {form.closedMessage || "We're sorry, but submissions for this form are currently closed. If you believe this is an error, please contact the form owner."}
          </p>
        </div>
      </div>
    );
  }

  const schema = JSON.parse(form.schema);

  return (
    <>
      <link rel="stylesheet" href="/form.css" />
      <CreatorBadge position="bottom-left" />
      
      {/* Global CSS from user's original HTML is loaded via /form.css */}
      <div className="view active font-ibm-plex-sans" style={{ display: 'block' }}>


        <div id="form-wrap">
          <FormViewer formId={form.id} schema={schema} />
        </div>
      </div>
    </>
  );
}
