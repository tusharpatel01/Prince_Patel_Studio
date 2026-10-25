import { useLoad, Bars, State, Stat } from './ui';
import { svcName } from './Dashboard';

export default function Analytics() {
  const { data: s, error, loading } = useLoad('/admin/stats');
  if (!s) return <State loading={loading} error={error} />;
  const rows = (o) => Object.entries(o).map(([label, value]) => ({ label, value }));
  return (
    <div>
      <h1 className="font-display text-4xl">Lead and inquiry analytics</h1>
      <p className="mt-2 text-sm text-muted">Counted from your stored inquiries and quotations (archived inquiries excluded).</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Inquiries" value={s.total} /><Stat label="Quotes sent" value={s.quotesSent} /><Stat label="Quotes accepted" value={s.quotesByStatus.Accepted} /><Stat label="Approved projects" value={s.approvedProjects} /></div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section><h2 className="font-medium">Last 6 months</h2><div className="mt-3"><Bars items={s.months.map((m) => ({ label: m.month, value: m.count }))} /></div></section>
        <section><h2 className="font-medium">Services requested</h2><div className="mt-3"><Bars items={s.services.map((x) => ({ label: svcName(x.service), value: x.count }))} /></div></section>
        <section><h2 className="font-medium">Inquiry pipeline</h2><div className="mt-3"><Bars items={rows(s.byStatus)} /></div></section>
        <section><h2 className="font-medium">Quotation outcomes</h2><div className="mt-3"><Bars items={rows(s.quotesByStatus)} /></div></section>
      </div>
    </div>
  );
}
