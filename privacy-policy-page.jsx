export const metadata = {
  title: "Privacy Policy - Pickle & Score",
  description:
    "Privacy Policy for the Pickle & Score app: what the app keeps on your device, and what its ads and in-app purchases involve.",
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
            Pickle &amp; Score
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: November 25, 2026
          </p>

          <p className="text-base text-gray-700 mb-8">
            Pickle &amp; Score keeps your games on your phone. The free version
            shows small ads; this page explains exactly what that involves.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              What the App Keeps
            </h2>
            <p className="text-base text-gray-700">
              Everything the app saves (scores, player names, sessions, custom sounds and settings) stays on your device. There are no accounts, and none of it is sent anywhere.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Advertising
            </h2>
            <p className="text-base text-gray-700">
              The free version shows small banner ads from Google AdMob on a few screens (home, stats, settings and the Open Play summary), never while you score. To choose and measure ads, Google&apos;s software may collect your IP address and the approximate location it implies, information about your device and the app, how you interact with ads, and on Android the device&apos;s advertising ID. Google handles this under its own policy: <a href="https://policies.google.com/technologies/ads" className="text-blue-600 hover:text-blue-800 underline">policies.google.com/technologies/ads</a>. Ads are limited to content rated PG.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Your Consent
            </h2>
            <p className="text-base text-gray-700">
              In the EEA, the UK and Switzerland the app asks for your consent before showing personalised ads. You can change your choice at any time under Settings → Ads → Ad privacy choices.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Tracking on iPhone
            </h2>
            <p className="text-base text-gray-700">
              The app does not ask to track you, and it never reads the iPhone&apos;s advertising identifier.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Removing Ads
            </h2>
            <p className="text-base text-gray-700">
              Removing ads is an in-app purchase, monthly or lifetime, handled by the App Store or Google Play. The app never sees your payment details. Our purchase service, RevenueCat, receives an anonymous app user ID, your purchase history and basic device information so it can confirm and restore your ad-free status. It is not used for advertising. See <a href="https://www.revenuecat.com/privacy" className="text-blue-600 hover:text-blue-800 underline">RevenueCat&apos;s privacy policy</a>.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              When You Are Ad-Free
            </h2>
            <p className="text-base text-gray-700">
              Once you are ad-free, the ad software is not started at all, and the app no longer contacts any ad network.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Network Usage
            </h2>
            <p className="text-base text-gray-700">
              The app goes online only to load ads and to check or make purchases. Scoring, Open Play and everything else work fully offline.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Your Audio Files
            </h2>
            <p className="text-base text-gray-700">
              If you add your own soundboard clips, the system file picker asks you to choose a file, and a copy is saved inside the app on your device. Those clips are never uploaded, shared or included in the images you share.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Device Permissions
            </h2>
            <p className="text-base text-gray-700">
              The app does not use your camera, contacts or precise location. The only time it touches your files is when you pick an audio clip yourself.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Children
            </h2>
            <p className="text-base text-gray-700">
              The app is not directed at children under 13, and its ads are limited to content rated PG.
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
