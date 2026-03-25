import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete Account - Inland His Church",
  description:
    "Learn how to delete your account on the HIS App by Inland His Church",
};

export default function DeleteAccount() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen font-sans px-4 py-12">
      <main className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Delete Your Account
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          If you would like to delete your HIS App account, please follow the
          steps below. Deleting your account will permanently remove all of your
          data, including your profile information and any associated content.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            How to Delete Your Account
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-zinc-700 dark:text-zinc-300">
            <li>Open the HIS App on your device.</li>
            <li>
              Go to <strong>Profile</strong> by tapping the profile icon.
            </li>
            <li>
              Tap <strong>Settings</strong> (gear icon).
            </li>
            <li>
              Scroll down and tap{" "}
              <strong>&quot;Delete Account&quot;</strong>.
            </li>
            <li>Confirm the deletion when prompted.</li>
          </ol>
        </section>

        <section className="mb-8 rounded-lg border border-zinc-200 dark:border-zinc-700 p-5 bg-zinc-50 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-2">What Gets Deleted</h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
            <li>Your profile information and personal data</li>
            <li>All content you have created or uploaded</li>
            <li>Your account credentials</li>
          </ul>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
            This action is permanent and cannot be undone.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you are having trouble deleting your account, please contact us at{" "}
            <a
              href="mailto:rhosungpark@gmail.com"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              rhosungpark@gmail.com
            </a>
            .
          </p>
        </section>

        <Link
          href="/"
          className="inline-block rounded-full border border-solid border-black/[.08] px-5 py-3 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
