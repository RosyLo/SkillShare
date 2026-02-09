export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Introduction</h2>
            <p className="text-gray-700">
              We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-gray-700 mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Account information (name, email, profile picture)</li>
              <li>Profile information (skills, interests, location)</li>
              <li>Content you post or share on the platform</li>
              <li>Communications with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and facilitate connections</li>
              <li>Communicate with you about your account and our services</li>
              <li>Personalize your experience</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-700 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this privacy policy, please contact us at privacy@slashx.com
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
