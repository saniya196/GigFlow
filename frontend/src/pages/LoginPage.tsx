import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { LoginFormData } from '../types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/leads');
    },
    onError: () => toast.error('Invalid email or password'),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-5rem] top-[-5rem] h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Sign in to GigFlow – Smart Leads Dashboard</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />
            <Button type="submit" isLoading={isPending} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-sky-700 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
