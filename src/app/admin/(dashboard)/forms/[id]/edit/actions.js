'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { utapi } from '@/lib/uploadthing';

export async function updateForm(id, data) {
  const { title, description, slug, schema, isActive = true, endDate, ogImage, closedMessage } = data;

  await prisma.form.update({
    where: { id },
    data: {
      title,
      description,
      slug,
      schema,
      isActive,
      endDate: endDate ? new Date(endDate) : null,
      ogImage,
      closedMessage,
    }
  });

  // If we are closing the form, delete all files
  if (isActive === false) {
    const submissions = await prisma.submission.findMany({
      where: { formId: id }
    });

    const fileKeysToDelete = [];
    for (const sub of submissions) {
      if (sub.fileKeys) {
        try {
          const keys = JSON.parse(sub.fileKeys);
          if (Array.isArray(keys)) {
            fileKeysToDelete.push(...keys);
          }
        } catch (e) {}
      }
    }

    if (fileKeysToDelete.length > 0) {
      await utapi.deleteFiles(fileKeysToDelete).catch(console.error);
    }
  }

  revalidatePath('/admin');
  revalidatePath(`/f/${data.slug}`);
  revalidatePath(`/admin/forms/${id}`);
}
