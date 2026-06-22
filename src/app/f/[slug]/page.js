import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import FormViewer from './FormViewer';

export default async function PublicFormPage({ params }) {
  const { slug } = await params;
  
  let form = null;
  try {
    form = await prisma.form.findUnique({
      where: { slug }
    });
  } catch (err) {
    console.error('Database connection error on form page:', err);
  }

  if (!form) {
    notFound();
  }

  const isExpired = form.endDate && new Date() > new Date(form.endDate);

  if (!form.isActive || isExpired) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 font-ibm-plex-sans">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-custom-border">
          <Image src="/igws.png" alt="iGenius Kids World" width={80} height={80} className="mx-auto rounded-xl shadow-sm mb-6 opacity-70 grayscale" />
          <h1 className="text-2xl font-bold text-navy mb-3">Registration Closed</h1>
          <p className="text-muted leading-relaxed">
            We're sorry, but submissions for this form have been closed. If you believe this is an error, please contact the school administration.
          </p>
        </div>
      </div>
    );
  }

  const schema = JSON.parse(form.schema);

  return (
    <>
      <link rel="stylesheet" href="/form.css" />
      
      {/* Global CSS from user's original HTML is loaded via /form.css */}
      <div className="view active font-ibm-plex-sans" style={{ display: 'block' }}>
        <div className="form-hero text-center">
          <div className="hero-logo-wrap inline-block mx-auto mb-4">
            <Image src="/igws.png" alt="iGenius Kids World" width={100} height={100} className="mx-auto rounded-lg shadow-sm" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">{form.title}</h1>
          <p className="tagline mt-2 text-lg">{form.description}</p>
        </div>

        <div id="form-wrap">
          <FormViewer formId={form.id} schema={schema} />
        </div>
      </div>
    </>
  );
}
