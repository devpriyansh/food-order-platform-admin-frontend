import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', data);
      login(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">FoodAdmin</h2>
            <p className="text-gray-400">Sign in to staff portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
