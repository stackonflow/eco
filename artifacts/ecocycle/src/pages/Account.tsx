import { getGetCurrentUserQueryKey, useGetCurrentUser, useLogoutUser, useUpdateProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Check, Leaf, LoaderCircle, LogOut, Pencil, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

function displayRole(role: string) { return role === 'collector' ? 'Collector' : role === 'recycler' ? 'Recycling partner' : role === 'admin' ? 'Administrator' : 'Household member'; }
function readError(error: unknown) { if (error instanceof Error) return error.message; if (typeof error === 'object' && error !== null && 'error' in error) return String(error.error); return 'Something went wrong. Please try again.'; }

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
  useEffect(() => { if (profile) { setName(profile.name); setPhone(profile.phone ?? ''); setAddress(profile.address ?? ''); } }, [profile?.id, profile?.name, profile?.phone, profile?.address]);
  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrorMessage(''); setNotice('');
    updateProfile.mutate({ data: { name: name.trim(), phone: phone.trim() || null, address: address.trim() || null } }, {
      onSuccess: (response) => { queryClient.setQueryData(getGetCurrentUserQueryKey(), response); setEditing(false); setNotice('Your profile has been updated.'); },
      onError: (error) => setErrorMessage(readError(error)),
    });
  }
  function handleLogout() {
    setErrorMessage('');
    logout.mutate(undefined, { onSuccess: () => { queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() }); setLocation('/'); }, onError: (error) => setErrorMessage(readError(error)) });
  }
  if (account.isLoading) return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell py-16"><div className="surface animate-pulse rounded-lg p-8"><div className="h-5 w-32 rounded bg-[#dfe7dc]" /><div className="mt-6 h-10 w-2/3 rounded bg-[#dfe7dc]" /><div className="mt-8 h-36 rounded bg-[#e9eee5]" /></div></main><SiteFooter /></div>;
  if (account.isError || !profile) return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell grid min-h-[65vh] place-items-center py-16"><section className="surface w-full max-w-lg rounded-lg p-8 text-center sm:p-10"><span className="mx-auto grid size-14 place-items-center bg-[#e9f0e6] text-[#477956]"><UserRound size={23} /></span><h1 className="mt-5 text-2xl font-semibold tracking-[-.04em] text-[#20382b]">Your account lives here.</h1><p className="mt-3 text-sm leading-6 text-[#617267]">{account.isError ? 'Sign in to see and manage your EcoCycle profile.' : 'We could not find an active account session.'}</p>{account.isError && <p className="mt-2 text-xs text-[#8a5c43]" data-testid="status-account-session">{readError(account.error)}</p>}<div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button className="button-secondary" onClick={() => void account.refetch()} data-testid="button-account-retry"><RefreshCw size={15} /> Try again</button><Link href="/login" className="button-primary" data-testid="link-account-login">Sign in <ArrowRight size={15} /></Link></div><p className="mt-5 text-sm text-[#718075]">New to EcoCycle? <Link href="/register" className="text-[#31583c]" data-testid="link-account-register">Create an account</Link></p></section></main><SiteFooter /></div>;
  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell py-12 sm:py-16">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Your EcoCycle</p><h1 className="text-4xl font-semibold tracking-[-.055em] text-[#20382b] sm:text-5xl">Welcome, {profile.name.split(' ')[0]}.</h1><p className="mt-3 text-sm text-[#617267]">Your account details and preferences, together in one place.</p></div><button className="button-secondary !min-h-11 self-start sm:self-auto" onClick={handleLogout} disabled={logout.isPending} data-testid="button-account-logout">{logout.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <LogOut size={15} />} Sign out</button></div>
    {errorMessage && <div role="alert" className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="status-account-error">{errorMessage}</div>}
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded border border-[#c9ddc9] bg-[#edf5eb] px-4 py-3 text-sm text-[#31583c]" data-testid="status-profile-updated"><Check size={16} />{notice}</div>}
    <div className="grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
      <section className="surface p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div className="grid size-14 place-items-center bg-[#e9f0e6] text-[#477956]"><Leaf size={25} /></div><span className="status-pill" data-testid="text-account-role">{displayRole(profile.role)}</span></div><h2 className="mt-6 text-2xl font-semibold tracking-[-.04em] text-[#20382b]" data-testid="text-account-name">{profile.name}</h2><p className="mt-1 break-all text-sm text-[#617267]" data-testid="text-account-email">{profile.email}</p><div className="mt-7 space-y-4 border-t border-[#e0e5dc] pt-5"><div className="flex items-center gap-3 text-sm text-[#52695a]"><CalendarDays className="text-[#628568]" size={16} /><span>Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></div><div className="flex items-center gap-3 text-sm text-[#52695a]"><ShieldCheck className="text-[#628568]" size={16} /><span>Account access is protected by your sign-in</span></div></div>
        <div className="mt-7 border-t border-[#e0e5dc] pt-5"><p className="mb-3 text-[.68rem] font-bold uppercase tracking-[.12em] text-[#738276]">Quick links</p><div className="flex flex-wrap gap-2"><Link href="/submit-waste" className="button-secondary !min-h-10 !px-3 text-xs">Schedule a pickup <ArrowRight size={14} /></Link><Link href="/my-requests" className="button-secondary !min-h-10 !px-3 text-xs">My requests</Link>{profile.role === 'admin' && <Link href="/admin" className="button-secondary !min-h-10 !px-3 text-xs">Admin workspace</Link>}</div></div>
      </section>
      <section className="surface p-6 sm:p-8"><div className="mb-6 flex items-center justify-between gap-4"><div><p className="eyebrow mb-2">Personal details</p><h2 className="text-xl font-semibold tracking-[-.03em] text-[#20382b]">Profile information</h2></div>{!editing && <button className="button-secondary !min-h-10 !px-3 text-xs" onClick={() => { setEditing(true); setNotice(''); setErrorMessage(''); }} data-testid="button-profile-edit"><Pencil size={14} /> Edit</button>}</div>
        {editing ? <form className="space-y-4" onSubmit={handleSave}><label><span className="field-label">Full name</span><input className="field" type="text" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" /></label><label><span className="field-label">Phone number <span className="font-normal text-[#78877b]">Optional</span></span><input className="field" type="tel" maxLength={32} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a contact number" data-testid="input-profile-phone" /></label><label><span className="field-label">Address <span className="font-normal text-[#78877b]">Optional</span></span><textarea className="field min-h-24 resize-y" maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Add your pickup address" data-testid="input-profile-address" /></label><div className="flex flex-col gap-3 pt-1 sm:flex-row"><button className="button-primary disabled:opacity-60" type="submit" disabled={updateProfile.isPending} data-testid="button-profile-save">{updateProfile.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Check size={15} />} Save changes</button><button className="button-secondary" type="button" onClick={() => { setEditing(false); setName(profile.name); setPhone(profile.phone ?? ''); setAddress(profile.address ?? ''); setErrorMessage(''); }} data-testid="button-profile-cancel">Cancel</button></div></form> :
          <div className="space-y-4"><ProfileField label="Email address" value={profile.email} /><ProfileField label="Phone number" value={profile.phone} empty="No phone number added" /><ProfileField label="Address" value={profile.address} empty="No pickup address added" /><p className="border-t border-[#e0e5dc] pt-4 text-xs leading-5 text-[#718075]">Adding an address and phone number can make a future pickup easier to coordinate.</p></div>}
      </section>
    </div>
  </main><SiteFooter /></div>;
}
function ProfileField({ label, value, empty }: { label: string; value: string | null; empty?: string }) { return <div className="border-b border-[#e0e5dc] pb-4 last:border-0"><p className="text-[.68rem] font-semibold uppercase tracking-[.12em] text-[#738276]">{label}</p><p className={`mt-1.5 break-words text-sm ${value ? 'text-[#334d3b]' : 'text-[#859188]'}`} data-testid={`text-profile-${label.toLowerCase().replaceAll(' ', '-')}`}>{value || empty || 'Not provided'}</p></div>; }
