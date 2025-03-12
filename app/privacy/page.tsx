"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">1. Data Collection</h2>
              <p>We collect the following types of information:</p>
              <ul className="list-disc pl-6">
                <li>Account information (name, email, profile data)</li>
                <li>Resume and career-related content</li>
                <li>Usage data and service interactions</li>
                <li>Device and browser information</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. OpenAI Usage</h2>
              <p>CareerPal uses OpenAI&apos;s technology to provide:</p>
              <ul className="list-disc pl-6">
                <li>Resume optimization suggestions</li>
                <li>Cover letter generation</li>
                <li>Interview preparation assistance</li>
              </ul>
              <p>Your data shared with OpenAI is processed according to OpenAI&apos;s privacy standards and is not used for training their models.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Cookies</h2>
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6">
                <li>Maintain your session and preferences</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Enable certain functionality of our platform</li>
                <li>Remember your login status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. No Third-Party Data Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties. This does not include trusted partners who assist us in operating our website and serving you, as long as they agree to keep this information confidential.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Account Closure and Data Removal</h2>
              <p>When you close your account:</p>
              <ul className="list-disc pl-6">
                <li>All personal data is permanently deleted within 30 days</li>
                <li>Backup copies are removed within 90 days</li>
                <li>Anonymous, aggregated data may be retained</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. GDPR Data Protection Rights</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6">
                <li>Access your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Updates to Privacy Policy</h2>
              <p>We may update this policy periodically. Changes will be posted on this page with an updated revision date. For significant changes, we will notify you via email or through our platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
              <p>While we take reasonable measures to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Third-Party Links</h2>
              <p>Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of these sites. Please review their respective privacy policies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">10. Contact Us</h2>
              <p>For privacy-related inquiries or to exercise your data protection rights, please contact us at:</p>
              <ul className="list-none pl-6">
                <li>Email: privacy@careerpal.ai</li>
                <li>Address: [Your Company Address]</li>
              </ul>
            </section>

            <section className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 