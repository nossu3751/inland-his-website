import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Account - Inland His Church",
  description:
    "Learn how to delete your account on the HIS App by Inland His Church",
};

export default function DeleteAccount() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 mb-4">
        Delete Your Account
      </h1>
      <p className="text-gray-500 mb-10 text-lg leading-relaxed">
        If you would like to delete your HIS App account, please follow the
        steps below. Deleting your account will permanently remove all of your
        data, including your profile information and any associated content.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          How to Delete Your Account
        </h2>
        <ol className="space-y-4">
          {[
            "Open the HIS App on your device.",
            <>
              Go to <strong>Profile</strong> by tapping the profile icon.
            </>,
            <>
              Tap <strong>Settings</strong> (gear icon).
            </>,
            <>
              Scroll down and tap <strong>&quot;Delete Account&quot;</strong>.
            </>,
            "Confirm the deletion when prompted.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-gray-600 pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10 rounded-2xl border border-error-muted/50 bg-error/5 p-6">
        <h2 className="text-lg font-semibold text-error mb-3">
          What Gets Deleted
        </h2>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
            Your profile information and personal data
          </li>
          <li className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
            All content you have created or uploaded
          </li>
          <li className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
            Your account credentials
          </li>
        </ul>
        <p className="mt-4 text-sm font-medium text-error">
          This action is permanent and cannot be undone.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Need Help?
        </h2>
        <p className="text-gray-500">
          If you are having trouble deleting your account, please contact us
          at{" "}
          <a
            href="mailto:rhosungpark@gmail.com"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            rhosungpark@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
