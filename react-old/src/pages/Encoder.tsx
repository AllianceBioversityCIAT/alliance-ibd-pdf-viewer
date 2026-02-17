import { useState, useMemo } from 'react';
import { encodeBase64url } from '../utils/base64url';

type ValidationStatus = 'empty' | 'valid' | 'invalid';

export default function Encoder() {
  const [json, setJson] = useState('');

  const validation = useMemo<{ status: ValidationStatus; error?: string }>(() => {
    const trimmed = json.trim();
    if (!trimmed) return { status: 'empty' };
    try {
      JSON.parse(trimmed);
      return { status: 'valid' };
    } catch (e) {
      return { status: 'invalid', error: (e as Error).message };
    }
  }, [json]);

  const isValid = validation.status === 'valid';

  function handleOpen() {
    if (!isValid) return;
    const encoded = encodeBase64url(json.trim());
    const url = `${window.location.origin}/example?data=${encoded}`;
    window.open(url, '_blank');
  }

  const borderColor =
    validation.status === 'empty'
      ? 'border-white/20'
      : isValid
        ? 'border-[#11D4B3]'
        : 'border-red-400';

  return (
    <div className="min-h-screen bg-[#02211A] flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-white text-xl font-bold mb-1">JSON Encoder</h1>
        <p className="text-[#E2E0DF]/50 text-xs mb-4">
          Codificación: <span className="text-[#11D4B3] font-mono">Base64url</span> (RFC 4648)
        </p>

        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='Pega tu JSON aquí...'
          className={`w-full h-64 bg-[#02211A] border ${borderColor} rounded-lg p-4 text-[#E2E0DF] text-sm font-mono resize-y focus:outline-none placeholder-white/20 transition-colors`}
        />

        {/* Validation indicator */}
        <div className="flex items-center gap-2 mt-2 h-5">
          {validation.status === 'valid' && (
            <>
              <div className="w-2 h-2 rounded-full bg-[#11D4B3]" />
              <span className="text-[#11D4B3] text-xs">JSON válido</span>
            </>
          )}
          {validation.status === 'invalid' && (
            <>
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-400 text-xs">{validation.error}</span>
            </>
          )}
        </div>

        <button
          onClick={handleOpen}
          disabled={!isValid}
          className="mt-3 w-full bg-[#11D4B3] text-[#02211A] font-bold text-sm py-3 rounded-lg hover:bg-[#11D4B3]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Abrir en /example
        </button>

        <p className="text-[#E2E0DF]/30 text-[10px] text-center mt-4">
          CGIAR PDF Generator Service
        </p>
      </div>
    </div>
  );
}
