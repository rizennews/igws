import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormEditor from './FormEditor';

export default async function EditFormPage({ params }) {
  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id }
  });

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
    />
  );
}
