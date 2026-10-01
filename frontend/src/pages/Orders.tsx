import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Package, Clock, CheckCircle2, XCircle, ChefHat, Search, Edit2 } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Notes Modal
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    let reason = undefined;
    if (newStatus === 'Cancelled') {
      const input = window.prompt(`Please provide a reason for cancelling Order #${id}:`);
      if (input === null) return; // User cancelled the prompt
      if (!input.trim()) {
        toast.error('Cancellation reason is required');
        return;
      }
      reason = input;
    } else {
      if (!window.confirm(`Are you sure you want to mark Order #${id} as ${newStatus}?`)) return;
    }

    try {
      await api.put(`/orders/${id}/status`, { status: newStatus, reason });
      toast.success(`Order #${id} marked as ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleUpdateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotesId === null) return;
    setSavingNotes(true);
    try {
      await api.patch(`/orders/${editingNotesId}/notes`, { notes: notesValue });
      toast.success('Notes updated successfully');
      fetchOrders();
      setEditingNotesId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const openNotesModal = (id: number, currentNotes: string) => {
    setEditingNotesId(id);
    setNotesValue(currentNotes || '');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Placed': return { color: 'text-gray-400', border: 'border-gray-500', icon: Clock };
      case 'Accepted': return { color: 'text-emerald-400', border: 'border-emerald-500', icon: CheckCircle2 };
      case 'Preparing': return { color: 'text-orange-400', border: 'border-orange-500', icon: ChefHat };
      case 'Ready': return { color: 'text-purple-400', border: 'border-purple-500', icon: Package };
      case 'Completed': return { color: 'text-blue-400', border: 'border-blue-500', icon: CheckCircle2 };
      case 'Cancelled': return { color: 'text-red-400', border: 'border-red-500', icon: XCircle };
      default: return { color: 'text-gray-400', border: 'border-gray-500', icon: Clock };
    }
  };

  const getNextStatuses = (current: string) => {
    switch (current) {
      case 'Placed': return ['Accepted', 'Cancelled'];
      case 'Accepted': return ['Preparing', 'Cancelled'];
      case 'Preparing': return ['Ready', 'Cancelled'];
      case 'Ready': return ['Completed'];
      default: return [];
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idStr = String(o.id);
      const name = o.customer?.name?.toLowerCase() || '';
      const email = o.customer?.email?.toLowerCase() || '';
      return idStr.includes(q) || name.includes(q) || email.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Orders</h1>
          <p className="text-gray-400">Track and manage incoming customer orders.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search ID, name, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-700 rounded-xl bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Accepted">Accepted</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900 rounded-2xl border border-gray-800">
          <p>No orders match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredOrders.map(order => {
            const { color, border, icon: StatusIcon } = getStatusConfig(order.status);
            const nextStatuses = getNextStatuses(order.status);
            return (
              <div key={order.id} className={`bg-gray-900 border-l-4 ${border} rounded-r-2xl border-y border-r border-gray-800 p-6 shadow-lg flex flex-col`}>
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-800">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-xl text-white">Order #{order.id}</h3>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-xs font-bold uppercase tracking-wide ${color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-2"><span className="text-gray-500">Customer:</span> {order.customer?.name} ({order.customer?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Total</p>
                    <p className="font-bold text-2xl text-white">${Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Items</h4>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center text-gray-300 font-medium text-xs">{item.quantity}x</span>
                        <span className="text-gray-200">{item.food?.name}</span>
                      </div>
                      <span className="text-gray-400 font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Status History Timeline */}
                <div className="mb-6 bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Status Timeline</h4>
                  <div className="space-y-3">
                    {order.statusHistory?.map((history: any, idx: number) => (
                      <div key={history.id} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5"></div>
                          {idx !== order.statusHistory.length - 1 && <div className="w-px h-full bg-gray-800 my-1"></div>}
                        </div>
                        <div>
                          <p className="text-gray-300 font-medium">{history.status}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.createdAt).toLocaleString()} • {history.actorType} {history.changedByUser ? `(${history.changedByUser.name})` : ''}
                          </p>
                          {history.reason && <p className="text-xs text-red-400 mt-1">Reason: {history.reason}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Internal Notes</h4>
                    <button onClick={() => openNotesModal(order.id, order.notes)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  {order.notes ? (
                    <p className="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-800 whitespace-pre-wrap">{order.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes added.</p>
                  )}
                </div>

                {nextStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800 mt-auto">
                    <span className="text-sm text-gray-500 self-center mr-2">Update status:</span>
                    {nextStatuses.map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(order.id, st)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          st === 'Cancelled' 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-900/20'
                        }`}
                      >
                        Mark {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingNotesId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
              <h3 className="text-lg font-bold text-white">Edit Internal Notes</h3>
              <p className="text-sm text-gray-400 mt-1">Order #{editingNotesId}</p>
            </div>
            <form onSubmit={handleUpdateNotes} className="p-6">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add internal notes for staff here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingNotesId(null)} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={savingNotes} className="px-6 py-2 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50">
                  {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
