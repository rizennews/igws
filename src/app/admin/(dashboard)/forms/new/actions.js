'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createForm(data) {
  const { title, description, slug, schema, isActive = true, endDate } = data;
  
  if (!title || !slug || !schema) {
    throw new Error('Missing required fields');
  }

  const form = await prisma.form.create({
    data: {
      title,
      description,
      slug,
      schema,
      isActive,
      endDate: endDate ? new Date(endDate) : null,
    }
  });

  revalidatePath('/admin');
  return form;
}
