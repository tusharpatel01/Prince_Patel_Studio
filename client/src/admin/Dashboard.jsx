import { Link } from 'react-router-dom';
import { useLoad, Stat, Bars, State, day } from './ui';
import { services } from '../data/content';

export const svcName = (s) => services.find((x) => x.slug === s)?.title || (s === 'other' ? 'Other' : s);

export default function Dashboard() {
  const { data: s, error, loading } = useLoad('/admin/stats');
  if (!s) return <State loading={loading} error={error} />;
  const today = new Date(new Date().toDateString());
  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      {s.total === 0 && <p className="mt-4 border-l-2 border-stone pl-4 text-sm text-muted">No inquiries yet. Numbers appear here as soon as people contact you through the site.</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total inquiries" value={s.total} /><Stat label="New" value={s.new} /><Stat label="Quotes sent" value={s.quotesSent} /><Stat label="Approved projects" value={s.approvedProjects} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section><h2 className="font-medium">Inquiries by status</h2><div className="mt-3"><Bars items={Object.entries(s.byStatus).map(([label, value]) => ({ label, value }))} /></div></section>
        <section><h2 className="font-medium">Monthly inquiries</h2><div className="mt-3"><Bars items={s.months.map((m) => ({ label: m.month, value: m.count }))} /></div></section>
        <section><h2 className="font-medium">Popular services</h2><div className="mt-3"><Bars items={s.services.map((x) => ({ label: svcName(x.service), value: x.count }))} /></div></section>
        <section><h2 className="font-medium">Upcoming follow-ups</h2>
          {s.followUps.length === 0 ? <p className="mt-3 text-sm text-muted">No follow-ups scheduled.</p> : (
            <ul className="mt-3 divide-y divide-stone border-y border-stone text-sm">{s.followUps.map((i) => (
              <li key={i._id} className="flex justify-between py-2"><Link className="underline" to={`/admin/inquiries/${i._id}`}>{i.name}</Link><span className={new Date(i.followUpDate) < today ? 'text-red-700' : 'text-muted'}>{day(i.followUpDate)}{new Date(i.followUpDate) < today && ' (overdue)'}</span></li>
            ))}</ul>)}
        </section>
      </div>
      <section className="mt-10"><h2 className="font-medium">Recent inquiries</h2>
        {s.recent.length === 0 ? <p className="mt-3 text-sm text-muted">Nothing received yet.</p> : (
          <ul className="mt-3 divide-y divide-stone border-y border-stone text-sm">{s.recent.map((i) => (
            <li key={i._id} className="flex flex-wrap justify-between gap-2 py-2"><Link className="underline" to={`/admin/inquiries/${i._id}`}>{i.name} <span className="text-muted">{i.reference}</span></Link><span className="text-muted">{i.status} · {day(i.createdAt)}</span></li>
          ))}</ul>)}
      </section>
    </div>
  );
}
