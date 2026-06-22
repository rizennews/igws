import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logoutAction } from '../login/actions';

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
    <div className="min-h-screen bg-off-white flex flex-col font-jost">
      <nav className="bg-navy px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 border-b border-navy">
        <div className="flex items-center gap-4">
          <Image src="/igws.png" alt="iGenius Kids World" width={44} height={44} className="rounded-sm" />
          <div className="text-[15px] font-bold text-white tracking-[0.04em] leading-tight">
            iGenius Kids World
            <span className="block text-[10px] font-normal text-gold tracking-[0.12em] uppercase mt-px">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <Link href="/admin" className="px-5 py-2 rounded-md text-[13px] font-semibold transition-all tracking-[0.03em] hover:bg-white/10 text-white">
            Dashboard
          </Link>
          {isSuperAdmin && (
            <Link href="/admin/users" className="px-5 py-2 rounded-md text-[13px] font-semibold transition-all tracking-[0.03em] hover:bg-white/10 text-white">
              Manage Team
            </Link>
          )}
          <Link href="/admin/forms/new" className="ml-2 px-5 py-2 rounded-md text-[13px] font-semibold transition-all tracking-[0.03em] bg-gold text-navy hover:bg-gold/90">
            Create Form
          </Link>
          <form action={logoutAction} className="ml-2">
            <button type="submit" className="px-5 py-2 rounded-md text-[13px] font-semibold transition-all tracking-[0.03em] bg-[#101344] text-[#D5D8F0] hover:text-white hover:bg-black/20">
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-7">
        {children}
      </main>
    </div>
  );
}
