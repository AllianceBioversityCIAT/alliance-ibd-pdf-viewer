export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="text-center px-6 max-w-md">
        <div className="mb-8">
          <span className="text-[120px] font-bold text-neutral-900 leading-none">
            404
          </span>
        </div>
        <h1 className="text-neutral-900 text-xl font-semibold mb-3">
          Page not found
        </h1>
        <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or the report data has
          already been consumed.
        </p>
        <a
          href="/docs"
          className="inline-block bg-neutral-900 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Go to docs
        </a>
        <div className="border-t border-neutral-100 pt-4 mt-10">
          <p className="text-neutral-300 text-xs">
            CGIAR PDF Generator Service
          </p>
        </div>
      </div>
    </div>
  );
}
