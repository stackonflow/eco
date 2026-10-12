import { getGetCurrentUserQueryKey, useRegisterUser } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, LoaderCircle, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { AuthFrame } from '../components/AuthFrame';

type SignupRole = 'user' | 'collector' | 'recycler';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'error' in error) return String(error.error);
  return 'We could not create your account. Please try again.';
}

export default function Register() {
  const register = useRegisterUser();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignupRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    register.mutate({ data: { name: name.trim(), email: email.trim(), password, role } }, {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), response);
        void queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation('/account');
      },
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  }

  return (
    <AuthFrame eyebrow="Make the first move" title="Create your account" description="Join a more thoughtful route for the things you no longer need.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {errorMessage && <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" data-testid="status-register-error">{errorMessage}</div>}
        <label className="block space-y-2">
          <span className="field-label">Full name</span>
          <input className="field" type="text" name="name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" data-testid="input-register-name" />
        </label>
        <label className="block space-y-2">
          <span className="field-label">Email address</span>
          <input className="field" type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" data-testid="input-register-email" />
        </label>
        <label className="block space-y-2">
          <span className="field-label">I’m joining as</span>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select className="field appearance-none pl-11" value={role} onChange={(event) => setRole(event.target.value as SignupRole)} data-testid="select-register-role">
              <option value="user">Household member</option>
              <option value="collector">Collector</option>
              <option value="recycler">Recycling partner</option>
            </select>
          </span>
        </label>
        <label className="block space-y-2">
          <span className="field-label">Password</span>
          <span className="relative block">
            <input className="field pr-12" type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" data-testid="input-register-password" />
            <button type="button" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-[#718075] hover:text-[#214b34]" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-register-password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </span>
        </label>
        <p className="text-[0.7rem] leading-5 text-[#718075]">Use 8–128 characters. Public registration is available for households, collectors, and recycling partners.</p>
        <button className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={register.isPending} data-testid="button-register-submit">
          {register.isPending ? <><LoaderCircle className="animate-spin" size={16} /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#617267]">Already have an account? <Link href="/login" className="font-bold text-[#31583c] hover:text-[#20382b]" data-testid="link-register-login">Sign in</Link></p>
    </AuthFrame>
  );
}
