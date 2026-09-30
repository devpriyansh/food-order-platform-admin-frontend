import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';

const foodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid price required').refine((val) => parseFloat(val) > 0, 'Price must be greater than zero'),
  isAvailable: z.boolean(),
});

const Foods: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const { user } = useAuth();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: { name: '', description: '', price: '', isAvailable: true }
  });

  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods');
      setFoods(res.data);
    } catch (err) {
      toast.error('Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const openModal = (food: any = null) => {
    setEditingFood(food);
    if (food) {
      setValue('name', food.name);
      setValue('description', food.description);
      setValue('price', food.price.toString());
      setValue('isAvailable', food.isAvailable);
    } else {
      reset({ name: '', description: '', price: '', isAvailable: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFood(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingFood) {
        await api.put(`/foods/${editingFood.id}`, data);
        toast.success('Food updated successfully');
      } else {
        await api.post('/foods', data);
        toast.success('Food created successfully');
      }
      closeModal();
      fetchFoods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save food');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success('Food deleted successfully');
      fetchFoods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete food');
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    // Optimistic UI update
    setFoods(prev => prev.map(f => f.id === id ? { ...f, isAvailable: !currentStatus } : f));
    
    try {
      // Depending on the backend route, it might be PUT /foods/:id or PATCH /api/v1/foods/:id/availability
      // The instruction mentioned PATCH /api/v1/foods/:id/availability, let's just do PUT /foods/:id for now as that's what's currently configured.
      // Wait, the prompt specifically says: "Ensure the availability toggle switch immediately mutates state via PATCH /api/v1/foods/:id/availability with optimistic UI"
      // Let's implement PATCH /foods/:id/availability here. If it doesn't exist, I need to add it to the backend too. Let's stick to the prompt's request.
      await api.patch(`/foods/${id}/availability`, { isAvailable: !currentStatus });
      toast.success('Availability updated');
    } catch (err: any) {
      // Revert optimistic update
      setFoods(prev => prev.map(f => f.id === id ? { ...f, isAvailable: currentStatus } : f));
      toast.error(err.message || 'Failed to update availability');
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (availabilityFilter === 'Available' && !food.isAvailable) return false;
    if (availabilityFilter === 'Unavailable' && food.isAvailable) return false;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Menu Catalog</h1>
          <p className="text-gray-400">Manage your restaurant's food offerings.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search foods..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <select 
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-700 rounded-xl bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
          {user?.role === 'admin' && (
            <button onClick={() => openModal()} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-orange-900/20">
              <Plus className="w-4 h-4" /> Add Food
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFoods.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">No foods found matching your criteria.</div>
          ) : (
            filteredFoods.map(food => (
              <div key={food.id} className={`bg-gray-900 border ${food.isAvailable ? 'border-gray-800' : 'border-red-900/50'} rounded-2xl p-6 shadow-lg transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-white">{food.name}</h3>
                  <span className="font-bold text-orange-400 text-lg">${Number(food.price).toFixed(2)}</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{food.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <button
                    onClick={() => toggleAvailability(food.id, food.isAvailable)}
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${food.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                  >
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button onClick={() => openModal(food)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(food.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
              <h3 className="text-lg font-bold text-white">{editingFood ? 'Edit Food' : 'Add Food'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input {...register('name')} className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea {...register('description')} rows={3} className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                <input {...register('price')} type="text" className="block w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
                {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price.message as string}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input {...register('isAvailable')} type="checkbox" id="isAvailable" className="w-4 h-4 rounded border-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900 bg-gray-800" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-300">Is Available</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-6 py-2 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foods;
