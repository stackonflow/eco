import { getListAllWasteRatesQueryKey, getListAllWasteRequestsQueryKey, getListActiveWasteRatesQueryKey, useGetCurrentUser, useListAllWasteRates, useCreateWasteRate, useUpdateWasteRate, useListAllWasteRequests, useUpdateWasteRequestStatus, type WasteCategory, type WasteRate } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle, Plus, RefreshCw, ShieldAlert, SlidersHorizontal, Truck, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

const categories: WasteCategory[] = ['Plastic', 'Paper', 'Cardboard', 'Metal', 'Glass', 'E-waste', 'Organic waste'];
const states = ['pending', 'accepted', 'scheduled', 'completed', 'cancelled', 'rejected'] as const;
const errText = (e: unknown) => e instanceof Error ? e.message : 'The action could not be completed.';
const dateLabel = (v: string) => { const d = new Date(v); return Number.isNaN(d.valueOf()) ? v : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); };

export default function Admin() {
  const account = useGetCurrentUser();
  const isAdmin = account.data?.user?.role === 'admin';
  const rates = useListAllWasteRates({ query: { enabled: isAdmin, queryKey: getListAllWasteRatesQueryKey() } });
  const requests = useListAllWasteRequests({ query: { enabled: isAdmin, queryKey: getListAllWasteRequestsQueryKey() } });
  const createRate = useCreateWasteRate();
  const updateRate = useUpdateWasteRate();
  const updateRequest = useUpdateWasteRequestStatus();
  const client = useQueryClient();
  const [category, setCategory] = useState<WasteCategory>('Plastic');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const refreshRates = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: getListAllWasteRatesQueryKey() }),
      client.invalidateQueries({ queryKey: getListActiveWasteRatesQueryKey() }),
    ]);
  };
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    createRate.mutate({ data: { category, ratePerKg: Number(price) } }, {
      onSuccess: async () => { setPrice(''); setNotice('Rate created.'); await refreshRates(); },
      onError: (e) => setError(errText(e)),
    });
  }
  function saveRate(rate: WasteRate) {
    setError(''); setNotice('');
    updateRate.mutate({ rateId: rate.id, data: { ratePerKg: Number(editingPrice) } }, {
      onSuccess: async () => { setEditingId(null); setNotice(`${rate.category} rate updated.`); await refreshRates(); },
      onError: (e) => setError(errText(e)),
    });
  }
  function toggleRate(rate: WasteRate) {
    if (rate.active && !window.confirm(`Deactivate the ${rate.category} rate? It will no longer be available for new pickup requests.`)) return;
    setBusyId(rate.id); setError(''); setNotice('');
    updateRate.mutate({ rateId: rate.id, data: { active: !rate.active } }, {
      onSuccess: async () => { setBusyId(''); setNotice(`${rate.category} rate ${rate.active ? 'deactivated' : 'reactivated'}.`); await refreshRates(); },
      onError: (e) => { setBusyId(''); setError(errText(e)); },
    });
  }
  function changeStatus(id: string, status: typeof states[number]) {
    setBusyId(id); setError(''); setNotice('');
    updateRequest.mutate({ requestId: id, data: { status } }, {
      onSuccess: async () => { setBusyId(''); setNotice('Pickup request status updated.'); await client.invalidateQueries({ queryKey: getListAllWasteRequestsQueryKey() }); },
      onError: (e) => { setBusyId(''); setError(errText(e)); },
    });
  }

  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell min-h-[70vh] py-12 sm:py-16">
    {account.isLoading ? <div className="surface animate-pulse rounded-lg p-8"><div className="h-7 w-52 rounded bg-[#dfe7dc]" /><div className="mt-6 h-40 rounded bg-[#e9eee5]" /></div>
    : account.isError || !account.data?.user ? <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center"><ShieldAlert className="mx-auto text-[#52745a]" size={32} /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">Administrator sign-in required</h1><p className="mt-3 text-sm leading-6 text-[#617267]">Sign in with an administrator account to manage rates and pickup requests. The API will verify permissions for every change.</p><Link href="/login" className="button-primary mt-6">Sign in</Link></section>
    : !isAdmin ? <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center"><ShieldAlert className="mx-auto text-[#8a5c43]" size={32} /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">This area is restricted</h1><p className="mt-3 text-sm leading-6 text-[#617267]">Your account does not have administrator access. No management data was requested.</p><Link href="/account" className="button-secondary mt-6">Back to your account</Link></section>
    : <><div className="mb-8"><p className="eyebrow mb-3">Operations console</p><h1 className="text-4xl font-semibold tracking-[-.05em] text-[#20382b] sm:text-5xl">Admin workspace</h1><p className="mt-3 text-sm text-[#617267]">Maintain transparent material rates and keep each pickup handoff moving.</p></div>
      {error && <div role="alert" className="mb-4 flex items-start justify-between gap-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded border border-[#c9ddc9] bg-[#edf5eb] px-4 py-3 text-sm text-[#31583c]"><Check size={16} />{notice}</div>}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center bg-[#e7eee3] text-[#477956]"><SlidersHorizontal size={19} /></span><div><h2 className="text-2xl font-semibold text-[#20382b]">Material rates</h2><p className="text-sm text-[#617267]">Active rates inform pickup estimates. Changes apply to future submissions.</p></div></div>
        <form onSubmit={create} className="surface mb-4 grid gap-3 rounded-lg p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <label><span className="field-label">Category</span><select className="field" value={category} onChange={(e) => setCategory(e.target.value as WasteCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="field-label">Rate per kg</span><input className="field" type="number" required min="0.01" max="1000000" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" /></label>
          <button className="button-primary" disabled={createRate.isPending}>{createRate.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Plus size={16} />} Add rate</button>
        </form>
        {rates.isLoading ? <div className="surface animate-pulse rounded-lg p-6"><div className="h-5 w-44 rounded bg-[#dfe7dc]" /><div className="mt-5 h-16 rounded bg-[#e9eee5]" /></div>
        : rates.isError ? <section role="alert" className="surface rounded-lg p-6"><p className="font-semibold text-[#20382b]">Rates could not be loaded</p><button className="button-secondary mt-4" onClick={() => void rates.refetch()}><RefreshCw size={14} /> Retry</button></section>
        : !rates.data?.length ? <div className="surface rounded-lg p-7 text-center text-sm text-[#617267]">No rates have been created yet. Add the first material rate above.</div>
        : <div className="space-y-2">{rates.data.map((rate) => <article key={rate.id} className="surface grid gap-4 rounded-lg p-4 sm:grid-cols-[1fr_auto] sm:items-center" data-testid={`rate-${rate.id}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-semibold text-[#20382b]">{rate.category}</h3><span className={`status-pill ${rate.active ? '' : 'opacity-60'}`}>{rate.active ? 'Active' : 'Inactive'}</span><span className="text-sm text-[#617267]">${Number(rate.ratePerKg).toFixed(2)} / kg</span></div>
          <div className="flex flex-wrap items-center gap-2">{editingId === rate.id ? <><input aria-label={`Edit ${rate.category} rate`} className="field !w-32 !py-2" type="number" min="0.01" max="1000000" step="0.01" value={editingPrice} onChange={(e) => setEditingPrice(e.target.value)} /><button className="button-primary !min-h-9 !px-3 text-xs" onClick={() => saveRate(rate)} disabled={updateRate.isPending}>Save</button><button className="button-secondary !min-h-9 !px-3 text-xs" onClick={() => setEditingId(null)}>Cancel</button></> : <><button className="button-secondary !min-h-9 !px-3 text-xs" onClick={() => { setEditingId(rate.id); setEditingPrice(String(rate.ratePerKg)); }}>Edit rate</button><button className="button-secondary !min-h-9 !px-3 text-xs" disabled={busyId === rate.id} onClick={() => toggleRate(rate)}>{busyId === rate.id ? <LoaderCircle className="animate-spin" size={14} /> : null}{rate.active ? 'Deactivate' : 'Reactivate'}</button></>}</div>
        </article>)}</div>}
      </section>
      <section>
        <div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center bg-[#e7eee3] text-[#477956]"><Truck size={19} /></span><div><h2 className="text-2xl font-semibold text-[#20382b]">Pickup requests</h2><p className="text-sm text-[#617267]">Review submitted details and update request status.</p></div></div>
        {requests.isLoading ? <div className="surface animate-pulse rounded-lg p-6"><div className="h-5 w-44 rounded bg-[#dfe7dc]" /><div className="mt-5 h-24 rounded bg-[#e9eee5]" /></div>
        : requests.isError ? <section role="alert" className="surface rounded-lg p-6"><p className="font-semibold text-[#20382b]">Pickup requests could not be loaded</p><p className="mt-2 text-sm text-[#617267]">Confirm administrator permissions and try again.</p><button className="button-secondary mt-4" onClick={() => void requests.refetch()}><RefreshCw size={14} /> Retry</button></section>
        : !requests.data?.length ? <div className="surface rounded-lg p-7 text-center text-sm text-[#617267]">No pickup requests have been submitted.</div>
        : <div className="space-y-3">{requests.data.map((request) => <article key={request.id} className="surface rounded-lg p-5 sm:p-6" data-testid={`admin-request-${request.id}`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-semibold text-[#20382b]">{request.category} · {request.estimatedQuantityKg} kg</h3><span className="status-pill">{request.status}</span></div><p className="mt-2 text-sm text-[#52695a]">{request.userName || 'Household'} {request.userEmail ? `· ${request.userEmail}` : ''}</p><p className="mt-1 text-sm text-[#617267]">{request.pickupAddress}</p><p className="mt-1 text-xs text-[#738276]">Preferred: {dateLabel(request.preferredPickupAt)} · Estimate ${Number(request.estimatedValue).toFixed(2)}</p>{request.description && <p className="mt-2 text-sm text-[#617267]">{request.description}</p>}</div>
            <label className="w-full sm:w-48"><span className="field-label">Update status</span><select className="field" value={request.status} disabled={busyId === request.id} onChange={(e) => changeStatus(request.id, e.target.value as typeof states[number])}>{states.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select></label>
          </div>
        </article>)}</div>}
      </section>
    </>}
  </main><SiteFooter /></div>;
}
