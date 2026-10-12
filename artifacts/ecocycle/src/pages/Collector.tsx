import { getListCollectorAssignmentsQueryKey, getListAllWasteRequestsQueryKey, getListInventoryBatchesQueryKey, getListAllReceiptsQueryKey, useGetCurrentUser, useListCollectorAssignments, useUpdateCollectorPickupStatus, useVerifyCollection, CollectionQuality, type CollectionQuality as Quality } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ClipboardCheck, LoaderCircle, RefreshCw, ShieldAlert, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const qualityOptions: Quality[] = [CollectionQuality.excellent, CollectionQuality.good, CollectionQuality.fair, CollectionQuality.poor];
const dateText = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';

export default function Collector() {
  const account = useGetCurrentUser();
  const isCollector = account.data?.user?.role === 'collector';
  const assignments = useListCollectorAssignments({ query: { enabled: isCollector, queryKey: getListCollectorAssignmentsQueryKey() } });
  const markCollected = useUpdateCollectorPickupStatus();
  const verify = useVerifyCollection();
  const client = useQueryClient();
  const [formId, setFormId] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [quality, setQuality] = useState<Quality>(CollectionQuality.good);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const invalidate = async () => Promise.all([
    client.invalidateQueries({ queryKey: getListCollectorAssignmentsQueryKey() }),
    client.invalidateQueries({ queryKey: getListAllWasteRequestsQueryKey() }),
    client.invalidateQueries({ queryKey: getListInventoryBatchesQueryKey() }),
    client.invalidateQueries({ queryKey: getListAllReceiptsQueryKey() }),
  ]);
  const beginVerify = (requestId: string) => { setFormId(formId === requestId ? '' : requestId); setError(''); setFeedback(''); };
  const submitVerification = (event: React.FormEvent<HTMLFormElement>, requestId: string) => {
    event.preventDefault(); setError(''); setFeedback('');
    verify.mutate({ requestId, data: { actualWeightKg: Number(weight), ratePerKg: Number(rate), quality, notes: notes.trim() || undefined } }, {
      onSuccess: async () => { await invalidate(); setFormId(''); setWeight(''); setNotes(''); setFeedback('Collection verified. Receipt and inventory record are now available.'); },
      onError: (reason) => setError(reason instanceof Error ? reason.message : 'Verification could not be completed.'),
    });
  };
  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell min-h-[70vh] py-12 sm:py-16">
    {account.isLoading ? <Loading /> : account.isError || !account.data?.user ? <Gate title="Collector sign-in required" text="Sign in to view pickups assigned to your account." /> : !isCollector ? <Gate title="Collector access only" text="This workspace is available to signed-in collector accounts." back /> : <>
      <header className="mb-8"><p className="eyebrow mb-3">Field operations</p><h1 className="text-4xl font-semibold tracking-[-.05em] text-[#20382b] sm:text-5xl">Assigned pickups</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#617267]">Confirm a collection on site, then record the measured weight and quality. That verified record establishes the household receipt and material batch.</p></header>
      {feedback && <p role="status" className="mb-4 flex items-center gap-2 border border-[#c9ddc9] bg-[#edf5eb] px-4 py-3 text-sm text-[#31583c]"><Check size={16} />{feedback}</p>}
      {error && <p role="alert" className="mb-4 border border-[#e1c7bd] bg-[#f9eeea] px-4 py-3 text-sm text-[#8b4637]">{error}</p>}
      {assignments.isLoading ? <Loading /> : assignments.isError ? <section role="alert" className="surface rounded-lg p-7"><h2 className="font-semibold">Assignments unavailable</h2><p className="mt-2 text-sm text-[#617267]">We could not retrieve your pickup list.</p><button className="button-secondary mt-4" onClick={() => void assignments.refetch()}><RefreshCw size={15} /> Retry</button></section> : !assignments.data?.length ? <section className="surface rounded-lg px-6 py-12 text-center"><Truck className="mx-auto text-[#77927a]" size={30} /><h2 className="mt-4 text-2xl font-semibold text-[#20382b]">No pickups assigned</h2><p className="mt-2 text-sm text-[#617267]">New assignments will appear here when operations schedules them.</p></section> : <div className="space-y-4">{assignments.data.map((request) => <article key={request.id} className="surface rounded-lg p-5 sm:p-6" data-testid={`collector-assignment-${request.id}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold text-[#20382b]">{request.category} · {request.estimatedQuantityKg} kg estimate</h2><span className="status-pill">{request.status}</span></div><p className="mt-2 text-sm text-[#52695a]">{request.userName ?? 'Household'}{request.userEmail ? ` · ${request.userEmail}` : ''}</p><p className="mt-1 break-words text-sm text-[#617267]">{request.pickupAddress}</p><p className="mt-2 text-xs text-[#738276]">Scheduled: {dateText(request.scheduledAt ?? request.preferredPickupAt)}</p>{request.description && <p className="mt-2 text-sm text-[#617267]">{request.description}</p>}</div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">{request.status === 'scheduled' || request.status === 'accepted' ? <button className="button-primary !min-h-10 !px-3 text-xs" disabled={markCollected.isPending} onClick={() => { setError(''); markCollected.mutate({ requestId: request.id, data: { status: 'collected' } }, { onSuccess: async () => { await invalidate(); setFeedback('Pickup marked collected. Complete verification to produce its receipt and batch.'); }, onError: (e) => setError(e instanceof Error ? e.message : 'Could not update pickup status.') }); }}><Check size={15} /> Mark collected</button> : null}
        {(request.status === 'collected' || request.status === 'verified') && !request.verification && <button className="button-secondary !min-h-10 !px-3 text-xs" onClick={() => beginVerify(request.id)}><ClipboardCheck size={15} /> Verify collection</button>}</div></div>
        {formId === request.id && <form onSubmit={(event) => submitVerification(event, request.id)} className="mt-5 grid gap-4 border-t border-[#e0e5dc] pt-5 sm:grid-cols-2">
          <label><span className="field-label">Verified weight (kg)</span><input className="field" type="number" required min="0.01" max="100000" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
          <label><span className="field-label">Approved rate per kg</span><input className="field" type="number" required min="0.01" max="1000000" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
          <label><span className="field-label">Material quality</span><select className="field" value={quality} onChange={(e) => setQuality(e.target.value as Quality)}>{qualityOptions.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
          <label><span className="field-label">Verification notes <span className="font-normal text-[#78877b]">Optional</span></span><input className="field" maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          <div className="flex flex-wrap gap-2 sm:col-span-2"><button className="button-primary" disabled={verify.isPending}>{verify.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Check size={15} />} Confirm verification</button><button type="button" className="button-secondary" onClick={() => setFormId('')}>Cancel</button></div>
        </form>}
      </article>)}</div>}
    </>}
  </main><SiteFooter /></div>;
}
function Loading() { return <div className="surface animate-pulse rounded-lg p-7" aria-label="Loading"><div className="h-6 w-48 rounded bg-[#dfe7dc]" /><div className="mt-5 h-24 rounded bg-[#e9eee5]" /></div>; }
function Gate({ title, text, back = false }: { title: string; text: string; back?: boolean }) { return <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center"><ShieldAlert className="mx-auto text-[#52745a]" size={30} /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#617267]">{text}</p><Link href={back ? '/account' : '/login'} className="button-primary mt-6">{back ? 'Back to account' : 'Sign in'}</Link></section>; }
