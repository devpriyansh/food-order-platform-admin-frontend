import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Plus, ShieldAlert, X } from 'lucide-react';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'operator']),
});

const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'operator' }
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post('/staff', data);
      toast.success('Staff created successfully');
      closeModal();
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/staff/${id}/status`, { status: newStatus });
      toast.success(`Staff marked as ${newStatus}`);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff Management</h1>
          <p className="text-gray-400">Manage admins and operators.</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-orange-900/20">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800/50 text-gray-300 uppercase font-semibold text-xs tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{staff.name}</td>
                    <td className="px-6 py-4">{staff.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase ${staff.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {staff.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${staff.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(staff.id, staff.status)}
                        className={`text-sm font-medium hover:underline ${staff.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      >
                        {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
              <h3 className="text-lg font-bold text-white">Add New Staff</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input {...register('name')} className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input {...register('email')} type="email" className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input {...register('password')} type="password" className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select {...register('role')} className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all">
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role.message as string}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-6 py-2 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
