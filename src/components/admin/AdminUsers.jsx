import { useState, useEffect } from 'react';
import { Users, Shield, User } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/users');
      setUsers(res);
    } catch (err) {
      console.error('Fetch admin users error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      addToast(`Role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      addToast('Failed to update user role', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Directory & Role Management</h1>
        <p className="text-xs text-gray-400 mt-1">Manage accounts, permissions, and administrator access control</p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading users list…</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800 uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-850 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                      {u.name[0]}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      Set as {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
