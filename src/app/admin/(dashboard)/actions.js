'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteForm(id) {
  // Delete the form and its submissions automatically via cascading or explicitly
  // First, delete submissions
  await prisma.submission.deleteMany({
    where: { formId: id }
  });

  // Then delete the form
  await prisma.form.delete({
    where: { id }
  });

  revalidatePath('/admin');
}
