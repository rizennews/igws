'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuth');
  if (!token) throw new Error('Not authenticated');
  const { payload } = await jwtVerify(token.value, JWT_SECRET);
  if (payload.role !== 'SUPER_ADMIN') throw new Error('Not authorized');
  return payload;
}

export async function createAdminUser(username, password, role) {
  try {
    await requireSuperAdmin();
    
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) return { success: false, error: 'Username already exists' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });
    return { success: true, admin };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminUser(id) {
  try {
    const payload = await requireSuperAdmin();
    if (payload.id === id) return { success: false, error: 'Cannot delete yourself' };

    await prisma.admin.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminRole(id, newRole) {
  try {
    const payload = await requireSuperAdmin();
    if (payload.id === id && newRole !== 'SUPER_ADMIN') {
      return { success: false, error: 'Cannot demote yourself' };
    }

    await prisma.admin.update({
      where: { id },
      data: { role: newRole }
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
