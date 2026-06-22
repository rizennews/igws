'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function submitForm(formId, dataString, fileKeys = "[]") {
  const submission = await prisma.submission.create({
    data: {
      formId,
      data: dataString,
      fileKeys
    }
  });

  revalidatePath('/admin');
  return { success: true, id: submission.id };
}

import fs from 'fs/promises';
import path from 'path';

export async function uploadFile(formData) {
  const file = formData.get('file');
  if (!file) return { error: 'No file provided' };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    await fs.writeFile(filePath, buffer);
    
    return { url: `/uploads/${uniqueName}` };
  } catch (err) {
    console.error('Upload failed:', err);
    return { error: 'Failed to upload file' };
  }
}

export async function trackView(formId) {
  try {
    await prisma.form.update({
      where: { id: formId },
      data: { views: { increment: 1 } }
    });
  } catch(e) {}
}

export async function trackDropoff(formId, stepIndex) {
  try {
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return;
    
    let stats = {};
    if (form.dropoffStats) {
      stats = JSON.parse(form.dropoffStats);
    }
    const key = `step_${stepIndex}`;
    stats[key] = (stats[key] || 0) + 1;
    
    await prisma.form.update({
      where: { id: formId },
      data: { dropoffStats: JSON.stringify(stats) }
    });
  } catch (e) {}
}
