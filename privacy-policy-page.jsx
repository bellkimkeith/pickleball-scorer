export const metadata = {
  title: "Privacy Policy - Pickleball Scorer",
  description:
    "Privacy Policy for Pickleball Scorer app. A fully offline pickleball scoring application that collects no user data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            Pickleball Scorer
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: February 16, 2026
          </p>

          <p className="text-base text-gray-700 mb-8">
            Pickleball Scorer is a fully offline application. Your privacy is
            important to us, and we want to be transparent about our practices.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Data Collection
            </h2>
            <p className="text-base text-gray-700">
              This app does not collect, store, transmit, or share any personal
              data or usage information. All game data (scores, player names, and
              settings) is stored locally on your device and is never sent to any
              server.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Network Usage
            </h2>
            <p className="text-base text-gray-700">
              This app does not make any network requests. It functions entirely
              offline and does not require an internet connection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Analytics
            </h2>
            <p className="text-base text-gray-700">
              This app does not use any analytics services, tracking tools, or
              advertising frameworks.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Third-Party Services
            </h2>
            <p className="text-base text-gray-700">
              This app does not integrate with any third-party services that
              collect user data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Device Permissions
            </h2>
            <p className="text-base text-gray-700">
              This app does not request access to your camera, contacts,
              location, or any other sensitive device features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Children&apos;s Privacy
            </h2>
            <p className="text-base text-gray-700">
              This app is safe for users of all ages. Since no data is collected,
              there are no concerns regarding children&apos;s privacy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Changes to This Policy
            </h2>
            <p className="text-base text-gray-700">
              If we make changes to this privacy policy, we will update the
              &quot;Last updated&quot; date above. We encourage you to review
              this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact
            </h2>
            <p className="text-base text-gray-700">
              If you have any questions about this privacy policy, please contact
              us at{" "}
              <a
                href="mailto:me@bellkimkeith.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                me@bellkimkeith.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
