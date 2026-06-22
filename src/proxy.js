import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authCookie = request.cookies.get('adminAuth');
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(authCookie.value, JWT_SECRET);
      
      // Protect /admin/users
      if (pathname.startsWith('/admin/users') && payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

    } catch (err) {
      // Invalid or expired token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
