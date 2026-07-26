'use client';

import { useState } from 'react';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import { createAdminUser, deleteAdminUser, updateAdminRole } from './actions';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function UserManagementClient({ initialAdmins, currentUserId }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: '' });
  const [confirmInfo, setConfirmInfo] = useState({ isOpen: false, message: '', action: null, isDestructive: false });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await createAdminUser(newUsername, newPassword, newRole);
      if (res.success) {
        setAdmins([...admins, res.admin]);
        setNewUsername('');
        setNewPassword('');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('An error occurred while creating user.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (id === currentUserId) {
      setAlertInfo({ isOpen: true, message: "You cannot delete your own account." });
      return;
    }
    setConfirmInfo({
      isOpen: true,
      message: "Are you sure you want to delete this admin?",
      isDestructive: true,
      action: async () => {
        try {
          const res = await deleteAdminUser(id);
          if (res.success) {
            setAdmins(prev => prev.filter(a => a.id !== id));
          } else {
            setAlertInfo({ isOpen: true, message: res.error });
          }
        } catch (err) {
          setAlertInfo({ isOpen: true, message: "Failed to delete user." });
        }
      }
    });
  };

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUserId && newRole !== 'SUPER_ADMIN') {
      setAlertInfo({ isOpen: true, message: "You cannot demote yourself." });
      return;
    }
    try {
      const res = await updateAdminRole(id, newRole);
      if (res.success) {
        setAdmins(prev => prev.map(a => a.id === id ? { ...a, role: newRole } : a));
      } else {
        setAlertInfo({ isOpen: true, message: res.error });
      }
    } catch (err) {
      setAlertInfo({ isOpen: true, message: "Failed to update role." });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      
      {/* List of Admins */}
      <div className="lg:col-span-2 bg-white border border-[#E4E8F6] rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-6 py-4.5 border-b border-[#E4E8F6] bg-[#FBFBFC]">
          <h3 className="text-[14px] font-bold text-navy uppercase tracking-wider">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] min-w-[500px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E4E8F6]">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted">User</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted">Role</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted">Joined</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F6]">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-purple/5 transition-colors">
                  <td className="py-4 px-6 font-bold text-navy flex items-center gap-2">
                    {admin.username}
                    {admin.id === currentUserId && (
                      <span className="bg-purple/10 text-purple px-2 py-0.5 rounded text-[10px] uppercase font-semibold">You</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <select 
                      value={admin.role}
                      onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                      disabled={admin.id === currentUserId}
                      className="text-[12px] font-semibold bg-white border border-custom-border rounded-lg px-2.5 py-1.5 outline-none focus:border-purple focus:ring-1 focus:ring-purple"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-muted">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(admin.id)}
                      disabled={admin.id === currentUserId}
                      className="p-2 rounded-full text-muted hover:text-red-500 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Form */}
      <div className="bg-white border border-[#E4E8F6] rounded-[24px] shadow-sm p-6 h-fit space-y-6">
        <div className="flex items-center gap-2 border-b border-[#F1F2F6] pb-4">
          <div className="p-2 bg-navy/5 text-navy rounded-xl">
            <UserPlus size={16} />
          </div>
          <h3 className="text-[15px] font-bold text-navy uppercase tracking-wider">Add Member</h3>
        </div>
        
        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted uppercase ml-2">Username</label>
            <input 
              type="text" 
              required
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)}
              className="w-full p-3 rounded-full border border-custom-border bg-white text-custom-text text-[13px] focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all placeholder:text-muted/50" 
              placeholder="e.g. jdoe"
            />
          </div>
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] font-bold text-muted uppercase ml-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-full border border-custom-border bg-white text-custom-text text-[13px] focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all placeholder:text-muted/50 pr-10" 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted uppercase ml-2">Assign Role</label>
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)}
              className="w-full p-3 rounded-full border border-custom-border bg-white text-custom-text text-[13px] focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all"
            >
              <option value="ADMIN">Admin (View & Create Forms)</option>
              <option value="SUPER_ADMIN">Super Admin (Manage Users)</option>
            </select>
          </div>
          
          {error && <div className="text-red-500 text-[12px] bg-red-50 border border-red-100 p-3 rounded-xl font-medium mt-1">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-navy text-white text-[14px] font-bold py-3 rounded-full hover:bg-purple transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>

      <AlertModal 
        isOpen={alertInfo.isOpen} 
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        message={alertInfo.message}
      />
      <ConfirmModal
        isOpen={confirmInfo.isOpen}
        onClose={() => setConfirmInfo({ ...confirmInfo, isOpen: false })}
        onConfirm={confirmInfo.action}
        message={confirmInfo.message}
        isDestructive={confirmInfo.isDestructive}
      />
    </div>
  );
}
