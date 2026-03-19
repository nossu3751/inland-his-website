import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen font-sans">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Inland His Church
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Welcome to Inland His Church. Home of the HIS App.
        </p>
        <nav className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="rounded-full border border-solid border-black/[.08] px-5 py-3 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
          >
            Privacy Policy
          </Link>
        </nav>
      </main>
    </div>
  );
}
