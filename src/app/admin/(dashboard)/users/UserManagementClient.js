'use client';

import { useState } from 'react';
import { Shield, Trash2, UserPlus, ShieldAlert } from 'lucide-react';
import { createAdminUser, deleteAdminUser, updateAdminRole } from './actions';

export default function UserManagementClient({ initialAdmins, currentUserId }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      const res = await deleteAdminUser(id);
      if (res.success) {
        setAdmins(admins.filter(a => a.id !== id));
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUserId && newRole !== 'SUPER_ADMIN') {
      alert("You cannot demote yourself.");
      return;
    }
    try {
      const res = await updateAdminRole(id, newRole);
      if (res.success) {
        setAdmins(admins.map(a => a.id === id ? { ...a, role: newRole } : a));
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Failed to update role.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* List of Admins */}
      <div className="md:col-span-2 bg-white border border-custom-border shadow-sm p-0">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-off-white border-b border-custom-border">
            <tr>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted">User</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted">Role</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted">Joined</th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id} className="border-b border-custom-border last:border-0 hover:bg-light-gray/30">
                <td className="p-4 font-bold text-navy flex items-center gap-2">
                  {admin.username}
                  {admin.id === currentUserId && (
                    <span className="bg-purple/10 text-purple px-2 py-0.5 rounded text-[10px] uppercase">You</span>
                  )}
                </td>
                <td className="p-4">
                  <select 
                    value={admin.role}
                    onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                    disabled={admin.id === currentUserId}
                    className="text-[12px] font-semibold bg-transparent border border-custom-border rounded px-2 py-1 outline-none focus:border-purple"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td className="p-4 text-muted">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(admin.id)}
                    disabled={admin.id === currentUserId}
                    className="text-muted hover:text-error disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New User Form */}
      <div className="bg-white border border-custom-border shadow-sm p-6 h-fit">
        <h3 className="text-[14px] font-bold text-navy mb-4 flex items-center gap-2">
          <UserPlus size={16} /> Add New Member
        </h3>
        <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase mb-1">Username</label>
            <input 
              type="text" 
              required
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)}
              className="w-full p-2 text-[13px] border border-custom-border rounded outline-none focus:border-purple" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-2 text-[13px] border border-custom-border rounded outline-none focus:border-purple" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase mb-1">Assign Role</label>
            <select 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)}
              className="w-full p-2 text-[13px] border border-custom-border rounded outline-none focus:border-purple"
            >
              <option value="ADMIN">Admin (View & Create Forms)</option>
              <option value="SUPER_ADMIN">Super Admin (Manage Users)</option>
            </select>
          </div>
          
          {error && <div className="text-error text-[12px] bg-error/10 p-2 rounded mt-2">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 bg-navy text-white text-[13px] font-bold py-2.5 rounded hover:bg-navy/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>

    </div>
  );
}
