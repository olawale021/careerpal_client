"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>By accessing and using CareerPal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Privacy Policy</h2>
              <p>Your use of CareerPal is also governed by our Privacy Policy. Please review our Privacy Policy at <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Newsletter and Marketing</h2>
              <p>By using CareerPal, you may receive periodic newsletters and marketing communications. You can opt out of these communications at any time through your account settings or by clicking the unsubscribe link in our emails.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. User Conduct</h2>
              <p>Users agree not to:</p>
              <ul className="list-disc pl-6">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Upload malicious content or viruses</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
              <p>All content, features, and functionality of CareerPal are owned by us and protected by international copyright, trademark, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Third-Party Links</h2>
              <p>CareerPal may contain links to third-party websites. We are not responsible for the content or practices of these sites.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Dispute Resolution</h2>
              <p>Any disputes arising from the use of CareerPal will be resolved through arbitration in accordance with the laws of [Your Jurisdiction].</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. Data Protection</h2>
              <p>We implement appropriate technical and organizational measures to ensure the security of your personal data. For more details, please refer to our Privacy Policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Termination</h2>
              <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any violation of these Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
              <p>CareerPal is provided &quot;as is&quot; without any warranties. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">11. Indemnification</h2>
              <p>You agree to indemnify and hold CareerPal harmless from any claims, damages, or expenses arising from your use of the service or violation of these Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">12. Refund Policy</h2>
              <p>CareerPal does not offer refunds for any payments made. All sales are final.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">13. Cookie Policy</h2>
              <p>We use cookies to enhance your experience. By using CareerPal, you consent to our use of cookies in accordance with our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">14. General Provisions</h2>
              <p>These Terms constitute the entire agreement between you and CareerPal. If any provision is found to be unenforceable, the remaining provisions will remain in effect.</p>
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