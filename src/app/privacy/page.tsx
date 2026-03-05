import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | InterviewSense',
  description: 'Privacy Policy for InterviewSense - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Header */}
      <header className="py-6 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-zinc-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-10 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p>
                InterviewSense (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to 
                protecting your personal data. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our interview practice platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-zinc-200 mb-3 mt-6">Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Resume, job preferences, and career information you choose to provide</li>
                <li><strong>Interview Responses:</strong> Your answers during practice interviews</li>
                <li><strong>Payment Information:</strong> Billing details processed through our secure payment provider</li>
                <li><strong>Communications:</strong> Messages you send to us through our contact form</li>
              </ul>

              <h3 className="text-xl font-medium text-zinc-200 mb-3 mt-6">Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, and time spent on the Service</li>
                <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
                <li><strong>Cookies:</strong> Small data files stored on your device to enhance your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Personalize your interview practice experience</li>
                <li>Generate feedback on your interview responses</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you important updates about your account or the Service</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to improve our features</li>
                <li>Protect against fraud and unauthorized access</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our Service (payment processing, hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee 
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to 
                provide you services. We may also retain certain information as required by law or for 
                legitimate business purposes. You may request deletion of your account and associated data 
                at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p className="mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us through our{' '}
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                  contact page
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences</li>
                <li>Understand how you use our Service</li>
                <li>Improve our Service based on usage patterns</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling cookies may affect 
                the functionality of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Third-Party Services</h2>
              <p>
                Our Service may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these third parties. We encourage you to 
                review the privacy policies of any third-party services you access through our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
              <p>
                Our Service is not intended for children under the age of 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information 
                from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                These countries may have different data protection laws. By using our Service, you consent 
                to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
                Your continued use of the Service after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
                  our contact page
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50 mt-auto bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-4 text-sm">
            <Link href="/terms" className="text-zinc-400 hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-center text-zinc-600 text-sm">
            © {new Date().getFullYear()} InterviewSense. Interview practice that works.
          </div>
        </div>
      </footer>
    </div>
  )
}
