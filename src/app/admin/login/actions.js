'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

export async function loginAction(username, password, rememberMe = false) {
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      // For initial setup: if no admins exist, create one
      const count = await prisma.admin.count();
      if (count === 0 && username === 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.admin.create({
          data: { username: 'admin', password: hashedPassword, role: 'SUPER_ADMIN' }
        });
        // Try to fetch again
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    }

    const realAdmin = await prisma.admin.findUnique({ where: { username } });
    if (!realAdmin) return { success: false, error: 'Invalid credentials' };

    const valid = await bcrypt.compare(password, realAdmin.password);
    if (!valid) return { success: false, error: 'Invalid credentials' };

    const expirationTime = rememberMe ? '30d' : '24h';
    
    const token = await new SignJWT({ id: realAdmin.id, username: realAdmin.username, role: realAdmin.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expirationTime)
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };
    
    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }

    cookieStore.set('adminAuth', token, cookieOptions);

    return { success: true };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'Database connection failed' };
  }
}

import { redirect } from 'next/navigation';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('adminAuth');
  redirect('/admin/login');
}
