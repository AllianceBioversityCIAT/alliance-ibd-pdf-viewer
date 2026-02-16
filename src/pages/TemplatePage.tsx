import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { templates } from '../templates';

export default function TemplatePage() {
  const { template } = useParams<{ template: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const paperWidth = searchParams.get('paperWidth') ?? '600';
  const paperHeight = searchParams.get('paperHeight') ?? '1000';
  const uuid = searchParams.get('uuid');

  const TemplateComponent = template ? templates[template] : undefined;

  useEffect(() => {
    if (uuid) {
      fetch(`/api/data?uuid=${encodeURIComponent(uuid)}`)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [uuid]);

  if (!TemplateComponent) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return null;
  }

  return (
    <div style={{ width: `${paperWidth}px`, height: `${paperHeight}px` }}>
      <TemplateComponent data={data} />
    </div>
  );
}
