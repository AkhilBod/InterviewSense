import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | InterviewSense',
  description: 'Terms of Service for InterviewSense - AI-powered interview practice platform.',
}

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-zinc-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-10 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using InterviewSense (&quot;Service&quot;), you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                InterviewSense provides an interview practice platform that helps users prepare for job interviews. 
                Our Service includes practice questions, feedback, and other tools designed to improve your 
                interview skills.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscriptions and Payment</h2>
              <p className="mb-4">
                InterviewSense offers free trial periods and paid subscription plans. By subscribing to a paid plan, you agree to the following:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You authorize us to charge the payment method provided for the subscription fee</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>You may cancel your subscription at any time through your account settings</li>
              </ul>
            </section>

            <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Refund Policy</h2>
              <p className="mb-4 font-medium text-zinc-200">
                All subscription purchases are final and non-refundable.
              </p>
              <p className="mb-4">
                We offer a free trial period so you can evaluate our Service before committing to a paid subscription. 
                Once you subscribe to a paid plan after the free trial, no refunds or credits will be issued for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Partial subscription periods</li>
                <li>Unused features or credits</li>
                <li>Subscription downgrades</li>
                <li>Cancellations before the subscription period ends</li>
              </ul>
              <p className="mt-4 text-zinc-400 text-sm">
                By subscribing to a paid plan, you acknowledge that you have used the free trial to evaluate 
                the Service and agree that all payments are final.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use</h2>
              <p className="mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by InterviewSense 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws. You may not copy, modify, distribute, sell, or lease any part 
                of our Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. User Content</h2>
              <p>
                You retain ownership of any content you submit to the Service. By submitting content, you 
                grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and process 
                your content solely for the purpose of providing the Service to you. We will not share your 
                personal interview responses with third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, 
                either express or implied. We do not guarantee that the Service will be uninterrupted, 
                secure, or error-free. We do not guarantee specific results from using the Service, 
                including job offers or interview success.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, InterviewSense shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including loss of profits, data, 
                or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason, including breach of these Terms. Upon termination, your right to use the 
                Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. We will provide notice 
                of any material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; 
                date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at{' '}
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
