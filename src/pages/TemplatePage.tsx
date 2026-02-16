import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { templates } from '../templates';
import { decodeBase64url } from '../utils/base64url';

export default function TemplatePage() {
  const { template } = useParams<{ template: string }>();
  const [searchParams] = useSearchParams();

  const paperWidth = searchParams.get('paperWidth') ?? '600';
  const paperHeight = searchParams.get('paperHeight') ?? '1000';
  const encodedData = searchParams.get('data');

  const TemplateComponent = template ? templates[template] : undefined;

  const data = useMemo(() => {
    console.log('[TemplatePage] template:', template);
    console.log('[TemplatePage] encodedData (base64url):', encodedData);

    if (!encodedData) {
      console.log('[TemplatePage] No data param provided');
      return null;
    }

    try {
      const decoded = decodeBase64url(encodedData);
      console.log('[TemplatePage] decoded string:', decoded);

      const parsed = JSON.parse(decoded);
      console.log('[TemplatePage] parsed JSON:', parsed);

      return parsed;
    } catch (e) {
      console.error('[TemplatePage] Error decoding data:', e);
      return null;
    }
  }, [encodedData, template]);

  if (!TemplateComponent) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ width: `${paperWidth}px`, height: `${paperHeight}px` }}>
      <TemplateComponent data={data} />
    </div>
  );
}
