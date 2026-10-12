import { getGetCurrentUserQueryKey, useLoginUser } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { AuthFrame } from '../components/AuthFrame';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'error' in error) return String(error.error);
  return 'We could not sign you in. Check your details and try again.';
}

export default function Login() {
  const login = useLoginUser();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    login.mutate({ data: { email: email.trim(), password } }, {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), response);
        void queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation('/account');
      },
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  }

  return (
    <AuthFrame eyebrow="Welcome back" title="Sign in to EcoCycle" description="Pick up where you left off. Your account keeps your EcoCycle details in one place.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {errorMessage && <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm leading-5 text-rose-200" data-testid="status-login-error">{errorMessage}</div>}
        <label className="block space-y-2">
          <span className="text-xs font-semibold text-slate-300">Email address</span>
          <input className="w-full rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10" type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" data-testid="input-login-email" />
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-semibold text-slate-300">Password</span>
          <span className="relative block">
            <input className="w-full rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 pr-12 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" data-testid="input-login-password" />
            <button type="button" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-slate-500 hover:text-slate-200" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-login-password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </span>
        </label>
        <button className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={login.isPending} data-testid="button-login-submit">
          {login.isPending ? <><LoaderCircle className="animate-spin" size={16} /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">New to EcoCycle? <Link href="/register" className="font-bold text-cyan-200 hover:text-cyan-100" data-testid="link-login-register">Create an account</Link></p>
    </AuthFrame>
  );
}
