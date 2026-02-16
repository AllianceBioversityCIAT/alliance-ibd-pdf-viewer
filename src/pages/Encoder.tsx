import { useState } from 'react';
import { encodeBase64url } from '../utils/base64url';

export default function Encoder() {
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  function handleOpen() {
    setError('');
    try {
      JSON.parse(json);
    } catch {
      setError('JSON inválido');
      return;
    }

    const encoded = encodeBase64url(json);
    const url = `${window.location.origin}/example?data=${encoded}`;
    window.open(url, '_blank');
  }

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
          className="w-full h-64 bg-[#02211A] border border-white/20 rounded-lg p-4 text-[#E2E0DF] text-sm font-mono resize-y focus:outline-none focus:border-[#11D4B3] placeholder-white/20"
        />

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

        <button
          onClick={handleOpen}
          disabled={!json.trim()}
          className="mt-4 w-full bg-[#11D4B3] text-[#02211A] font-bold text-sm py-3 rounded-lg hover:bg-[#11D4B3]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
