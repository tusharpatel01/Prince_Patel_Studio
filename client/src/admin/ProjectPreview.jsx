import { useParams } from 'react-router-dom';
import { useLoad, State } from './ui';
import ProjectDetail from '../pages/ProjectDetail';
import { normalizeProject } from '../content/normalize';

export default function ProjectPreview() {
  const { id } = useParams();
  const { data, error, loading } = useLoad('/admin/projects');
  const p = data?.find((x) => x._id === id);
  if (!data) return <State loading={loading} error={error} />;
  if (!p) return <p>Project not found.</p>;
  return (
    <div>
      <p className="mb-4 border-l-2 border-stone pl-3 text-sm text-muted">Preview as visitors would see it. This project is {p.published ? 'published' : 'a draft, not visible to the public'}.</p>
      <ProjectDetail preview={normalizeProject(p)} />
    </div>
  );
}
