import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logoutAction } from '../login/actions';
import CreatorBadge from '@/components/ui/CreatorBadge';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

export default async function AdminLayout({ children }) {
  let isSuperAdmin = false;
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuth');
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);
      if (payload.role === 'SUPER_ADMIN') {
        isSuperAdmin = true;
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col font-sans">
      <nav className="bg-white/90 backdrop-blur-md px-8 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-[#E4E8F6]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple/10 text-purple shadow-sm shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="text-[15px] font-bold text-navy tracking-tight leading-tight">
            FormFlow
            <span className="block text-[9px] font-semibold text-purple tracking-widest uppercase mt-px">
              Form Builder
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          <Link href="/admin" className="px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all text-custom-text hover:bg-light-gray">
            Dashboard
          </Link>
          {isSuperAdmin && (
            <Link href="/admin/users" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all text-custom-text hover:bg-light-gray">
              Manage Team
            </Link>
          )}
          <Link href="/admin/forms/new" className="hidden sm:inline-flex px-5 py-2 rounded-full text-[13px] font-semibold transition-all bg-purple text-white hover:bg-purple-mid hover:shadow-md shadow-sm">
            Create Form
          </Link>
          <form action={logoutAction} className="ml-1">
            <button type="submit" className="px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all bg-[#F1F2F6] text-custom-text hover:bg-[#E4E6ED]">
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <footer className="w-full text-center py-5 border-t border-[#E4E8F6] bg-white flex justify-center">
        <CreatorBadge position="center" />
      </footer>
    </div>
  );
}
