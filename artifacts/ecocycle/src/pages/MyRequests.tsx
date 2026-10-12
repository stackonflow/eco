import { useGetCurrentUser, useListMyWasteRequests, type PickupRequest } from '@workspace/api-client-react';
import { ArrowRight, ClipboardList, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

function dateLabel(value: string) { const d = new Date(value); return Number.isNaN(d.valueOf()) ? value : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
function RequestItem({ request }: { request: PickupRequest }) {
  return <article className="surface grid gap-4 rounded-lg p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6" data-testid={`request-${request.id}`}>
    <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold text-[#20382b]">{request.category}</h2><span className="status-pill">{request.status}</span></div>
      <p className="mt-2 text-sm text-[#617267]">{request.estimatedQuantityKg} kg estimated · pickup {dateLabel(request.preferredPickupAt)}</p>
      <p className="mt-1 text-sm text-[#617267]">{request.pickupAddress}</p>{request.description && <p className="mt-2 text-sm text-[#617267]">{request.description}</p>}</div>
    <div className="border-t border-[#e0e5dc] pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"><p className="text-xs uppercase tracking-wider text-[#738276]">Estimated value</p><p className="mt-1 text-xl font-semibold text-[#31583c]">${Number(request.estimatedValue).toFixed(2)}</p><p className="mt-1 text-xs text-[#738276]">${Number(request.ratePerKg).toFixed(2)} / kg</p></div>
  </article>;
}
export default function MyRequests() {
  const account = useGetCurrentUser();
  const requests = useListMyWasteRequests({ query: { enabled: Boolean(account.data?.user), queryKey: ['/api/waste-requests'] } });
  return <div className="min-h-[100dvh]"><SiteHeader /><main className="site-shell min-h-[68vh] py-12 sm:py-16">
    {account.isLoading ? <div className="surface animate-pulse rounded-lg p-8"><div className="h-7 w-52 rounded bg-[#dfe7dc]" /><div className="mt-6 h-32 rounded bg-[#e9eee5]" /></div>
    : account.isError || !account.data?.user ? <section className="surface mx-auto max-w-xl rounded-lg p-8 text-center"><ClipboardList size={30} className="mx-auto text-[#477956]" /><h1 className="mt-4 text-3xl font-semibold text-[#20382b]">Your requests, in one place</h1><p className="mt-3 text-sm leading-6 text-[#617267]">Sign in to view pickup requests submitted from your account.</p><Link href="/login" className="button-primary mt-6">Sign in <ArrowRight size={15} /></Link></section>
    : <><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Your collection history</p><h1 className="text-4xl font-semibold tracking-[-.05em] text-[#20382b] sm:text-5xl">My requests</h1><p className="mt-3 text-sm text-[#617267]">Track the status and details of your pickup requests.</p></div><Link href="/submit-waste" className="button-primary self-start">Schedule a pickup <ArrowRight size={15} /></Link></div>
      {requests.isLoading ? <div className="space-y-3" aria-label="Loading requests">{[1,2,3].map((n) => <div key={n} className="surface animate-pulse rounded-lg p-6"><div className="h-5 w-48 rounded bg-[#dfe7dc]" /><div className="mt-4 h-4 w-2/3 rounded bg-[#e9eee5]" /></div>)}</div>
      : requests.isError ? <section role="alert" className="surface rounded-lg p-7"><h2 className="font-semibold text-[#20382b]">Requests could not be loaded</h2><p className="mt-2 text-sm text-[#617267]">The service may be unavailable or your session may have expired.</p><button className="button-secondary mt-5" onClick={() => void requests.refetch()}><RefreshCw size={15} /> Try again</button></section>
      : !requests.data?.length ? <section className="surface rounded-lg px-6 py-12 text-center"><ClipboardList className="mx-auto text-[#78907b]" size={30} /><h2 className="mt-4 text-2xl font-semibold text-[#20382b]">No pickups requested yet</h2><p className="mt-2 text-sm text-[#617267]">When you schedule your first collection, its progress will appear here.</p><Link href="/submit-waste" className="button-primary mt-6">Schedule a pickup <ArrowRight size={15} /></Link></section>
      : <div className="space-y-3">{requests.data.map((request) => <RequestItem key={request.id} request={request} />)}</div>}</>}
  </main><SiteFooter /></div>;
}
