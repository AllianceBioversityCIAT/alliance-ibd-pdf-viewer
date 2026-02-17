export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#02211A] flex items-center justify-center font-sans">
      <div className="text-center px-6 max-w-md">
        <div className="mb-8">
          <span className="text-[120px] font-bold text-[#11D4B3] leading-none">404</span>
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-[#E2E0DF] text-sm mb-6 leading-relaxed">
          The page you are looking for doesn&apos;t exist or the report data has already been
          consumed.
        </p>
        <div className="border-t border-white/10 pt-6">
          <p className="text-[#E2E0DF]/50 text-xs">CGIAR PDF Generator Service</p>
        </div>
      </div>
    </div>
  );
}
