import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-navy-950 text-center">
      <div className="relative">
        <h1 className="text-[12rem] md:text-[16rem] font-black text-brand-50 dark:text-brand-500/10 animate-pulse select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">Lost in Space?</p>
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          The page you are looking for doesn&apos;t exist.
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          It looks like you took a wrong turn or the link is broken. Let&apos;s get you back on
          track.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
