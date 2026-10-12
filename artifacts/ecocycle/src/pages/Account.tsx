import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogoutUser, useUpdateProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Check, Leaf, LoaderCircle, LogOut, Pencil, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

function displayRole(role: string) {
  if (role === 'collector') return 'Collector';
  if (role === 'recycler') return 'Recycling partner';
  if (role === 'admin') return 'Administrator';
  return 'Household member';
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'error' in error) return String(error.error);
  return 'Something went wrong. Please try again.';
}

export default function Account() {
  const account = useGetCurrentUser();
  const updateProfile = useUpdateProfile();
  const logout = useLogoutUser();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const profile = account.data?.user;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone ?? '');
    setAddress(profile.address ?? '');
  }, [profile?.id, profile?.name, profile?.phone, profile?.address]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setNotice('');
    updateProfile.mutate({ data: { name: name.trim(), phone: phone.trim() || null, address: address.trim() || null } }, {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), response);
        setEditing(false);
        setNotice('Your profile has been updated.');
      },
      onError: (error) => setErrorMessage(readError(error)),
    });
  }

  function handleLogout() {
    setErrorMessage('');
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation('/');
      },
      onError: (error) => setErrorMessage(readError(error)),
    });
  }

  if (account.isLoading) {
    return (
      <div className="min-h-[100dvh]">
        <SiteHeader />
        <main className="site-shell py-16">
          <div className="animate-pulse rounded-[28px] border border-white/10 bg-[#101b2b] p-8">
            <div className="h-4 w-32 rounded bg-slate-700/60" />
            <div className="mt-6 h-10 w-2/3 rounded bg-slate-700/60" />
            <div className="mt-8 h-32 rounded-2xl bg-slate-800/70" />
          </div>
        </main>
      </div>
    );
  }

  if (account.isError || !profile) {
    return (
      <div className="min-h-[100dvh]">
        <SiteHeader />
        <main className="site-shell grid min-h-[65vh] place-items-center py-16">
          <section className="glow-card w-full max-w-lg rounded-[26px] p-8 text-center sm:p-10">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-violet-200/15 bg-violet-200/[0.07] text-violet-200"><UserRound size={23} /></span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.05em] text-slate-50">Your account lives here.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">{account.isError ? 'Sign in to see and manage your EcoCycle profile.' : 'We could not find an active account session.'}</p>
            {account.isError && <p className="mt-2 text-xs text-slate-600" data-testid="status-account-session">{readError(account.error)}</p>}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button className="button-secondary" onClick={() => void account.refetch()} data-testid="button-account-retry"><RefreshCw size={15} /> Try again</button>
              <Link href="/login" className="button-primary" data-testid="link-account-login">Sign in <ArrowRight size={15} /></Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">New to EcoCycle? <Link href="/register" className="text-cyan-200 hover:text-cyan-100" data-testid="link-account-register">Create an account</Link></p>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <main className="site-shell py-12 sm:py-16">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">Your EcoCycle</p>
            <h1 className="text-4xl font-extrabold tracking-[-0.065em] text-slate-50 sm:text-5xl">Welcome, {profile.name.split(' ')[0]}.</h1>
            <p className="mt-3 text-sm text-slate-400">Your account details and preferences, together in one place.</p>
          </div>
          <button className="button-secondary !min-h-11 self-start sm:self-auto" onClick={handleLogout} disabled={logout.isPending} data-testid="button-account-logout">
            {logout.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <LogOut size={15} />} Sign out
          </button>
        </div>
        {errorMessage && <div role="alert" className="mb-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-200" data-testid="status-account-error">{errorMessage}</div>}
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200/20 bg-emerald-200/[0.06] px-4 py-3 text-sm text-emerald-100" data-testid="status-profile-updated"><Check size={16} />{notice}</div>}
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="glow-card overflow-hidden rounded-[26px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="grid size-14 place-items-center rounded-2xl border border-cyan-100/20 bg-cyan-100/[0.08] text-cyan-200"><Leaf size={25} /></div>
              <span className="rounded-full border border-violet-200/15 bg-violet-200/[0.07] px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.11em] text-violet-100" data-testid="text-account-role">{displayRole(profile.role)}</span>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.05em] text-slate-50" data-testid="text-account-name">{profile.name}</h2>
            <p className="mt-1 break-all text-sm text-slate-400" data-testid="text-account-email">{profile.email}</p>
            <div className="mt-7 space-y-4 border-t border-white/[0.08] pt-5">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CalendarDays className="text-cyan-200" size={16} />
                <span>Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="text-violet-200" size={16} />
                <span>Account access is protected by your sign-in</span>
              </div>
            </div>
          </section>

          <section className="glow-card rounded-[26px] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Personal details</p>
                <h2 className="text-xl font-bold tracking-[-0.04em] text-slate-100">Profile information</h2>
              </div>
              {!editing && <button className="button-secondary !min-h-10 !px-3 text-xs" onClick={() => { setEditing(true); setNotice(''); setErrorMessage(''); }} data-testid="button-profile-edit"><Pencil size={14} /> Edit</button>}
            </div>
            {editing ? (
              <form className="space-y-4" onSubmit={handleSave}>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Full name</span>
                  <input className="w-full rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10" type="text" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} data-testid="input-profile-name" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Phone number <span className="font-normal text-slate-600">Optional</span></span>
                  <input className="w-full rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10" type="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Add a contact number" data-testid="input-profile-phone" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Address <span className="font-normal text-slate-600">Optional</span></span>
                  <textarea className="min-h-[94px] w-full resize-y rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10" maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Add your pickup address" data-testid="input-profile-address" />
                </label>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button className="button-primary disabled:opacity-60" type="submit" disabled={updateProfile.isPending} data-testid="button-profile-save">{updateProfile.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Check size={15} />} Save changes</button>
                  <button className="button-secondary" type="button" onClick={() => { setEditing(false); setName(profile.name); setPhone(profile.phone ?? ''); setAddress(profile.address ?? ''); setErrorMessage(''); }} data-testid="button-profile-cancel">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <ProfileField label="Email address" value={profile.email} />
                <ProfileField label="Phone number" value={profile.phone} empty="No phone number added" />
                <ProfileField label="Address" value={profile.address} empty="No pickup address added" />
                <p className="border-t border-white/[0.07] pt-4 text-xs leading-5 text-slate-500">Adding an address and phone number can make a future pickup easier to coordinate.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProfileField({ label, value, empty }: { label: string; value: string | null; empty?: string }) {
  return (
    <div className="border-b border-white/[0.07] pb-4 last:border-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-1.5 break-words text-sm ${value ? 'text-slate-200' : 'text-slate-600'}`} data-testid={`text-profile-${label.toLowerCase().replaceAll(' ', '-')}`}>{value || empty || 'Not provided'}</p>
    </div>
  );
}
