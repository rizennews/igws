import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import UserManagementClient from './UserManagementClient';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

export default async function ManageUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuth');
  let currentUser = null;

  if (!token) redirect('/admin/login');

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    if (payload.role !== 'SUPER_ADMIN') {
      redirect('/admin');
    }
    currentUser = payload;
  } catch (err) {
    redirect('/admin/login');
  }

  let admins = [];
  try {
    admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });
  } catch (err) {
    console.error('Failed to fetch admins:', err);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[20px] font-extrabold text-navy">Team Management</h2>
        <p className="text-[13px] text-muted mt-0.5">Manage administrators and their roles.</p>
      </div>

      <UserManagementClient initialAdmins={admins} currentUserId={currentUser.id} />
    </div>
  );
}
