export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <p className="text-gray-700 mb-4">
              By using SlashX, you agree that:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Discovery Only</h2>
            <p className="text-gray-700">
              SlashX is a discovery platform; we are not responsible for the quality of skill exchanges or the conduct of users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Safety First</h2>
            <p className="text-gray-700">
              You assume all risks when meeting other users at physical locations like Downtown Toronto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Content Rights</h2>
            <p className="text-gray-700">
              You grant SlashX the right to display your posted skills and topics to help other users find you.
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
