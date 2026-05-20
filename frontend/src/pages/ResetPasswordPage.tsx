import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ResetPasswordFormData) => authService.resetPassword(data.email, token!, data.newPassword),
    onSuccess: () => {
      toast.success('Password reset successful! You can now login with your new password.');
      navigate('/login');
    },
    onError: () => toast.error('Failed to reset password. The link may have expired.'),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">Invalid reset link</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            The password reset link is invalid or has expired.
          </p>
          <Button onClick={() => navigate('/forgot-password')}>Request new link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-5rem] top-[-5rem] h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Create a new password for your account</p>
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
              label="New password"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              autoComplete="new-password"
              {...register('newPassword')}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <Button type="submit" isLoading={isPending} className="w-full" size="lg">
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
