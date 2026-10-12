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
        {errorMessage && <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" data-testid="status-login-error">{errorMessage}</div>}
        <label className="block space-y-2">
          <span className="field-label">Email address</span>
          <input className="field" type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" data-testid="input-login-email" />
        </label>
        <label className="block space-y-2">
          <span className="field-label">Password</span>
          <span className="relative block">
            <input className="field pr-12" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" data-testid="input-login-password" />
            <button type="button" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-[#718075] hover:text-[#214b34]" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-login-password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </span>
        </label>
        <button className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={login.isPending} data-testid="button-login-submit">
          {login.isPending ? <><LoaderCircle className="animate-spin" size={16} /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#617267]">New to EcoCycle? <Link href="/register" className="font-bold text-[#31583c] hover:text-[#20382b]" data-testid="link-login-register">Create an account</Link></p>
    </AuthFrame>
  );
}
