import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="container mx-auto px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Lintora ("the Service"), you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by 
                the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Lintora provides AI-powered code review services using local machine learning models. 
                The Service analyzes code for security vulnerabilities, performance issues, code quality, 
                and best practices.
              </p>
              <p className="text-muted-foreground">
                Key features include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Local AI-powered code analysis</li>
                <li>Security, quality, and performance reviews</li>
                <li>Automatic fix suggestions</li>
                <li>Multi-language support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription and Billing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p><strong>Free Trial:</strong> New users receive 10 free code reviews upon registration.</p>
                <p><strong>Paid Plans:</strong> Subscription fees are billed in advance on a monthly basis 
                and are non-refundable except as required by law.</p>
                <p><strong>Cancellation:</strong> You may cancel your subscription at any time. 
                Cancellation will take effect at the end of the current billing period.</p>
                <p><strong>Price Changes:</strong> We reserve the right to modify pricing with 30 days' notice.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Privacy and Data Security</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Local Processing:</strong> All code analysis is performed locally on your machine 
                using Ollama. Your code is never transmitted to our servers or third parties.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Data Collection:</strong> We collect only minimal data necessary to provide 
                the Service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Account information (email, name)</li>
                <li>Usage statistics (number of reviews, analysis time)</li>
                <li>No code content is stored or transmitted</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to bypass usage limits or restrictions</li>
                <li>Reverse engineer or modify the Service</li>
                <li>Share your account credentials</li>
                <li>Use the Service to harm others or spread malware</li>
                <li>Resell or redistribute the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Your Code:</strong> You retain all rights to your code. We claim no ownership 
                over code you analyze with our Service.
              </p>
              <p className="text-muted-foreground">
                <strong>Our Service:</strong> Lintora and its original content, features, and functionality 
                are owned by us and protected by international copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Disclaimers and Limitations</h2>
              <p className="text-muted-foreground mb-4">
                <strong>AS-IS Service:</strong> The Service is provided "as is" without warranties of any kind.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>No Guarantee:</strong> While we strive for accuracy, we do not guarantee that 
                our analysis will find all issues or that suggested fixes are error-free.
              </p>
              <p className="text-muted-foreground">
                <strong>Limitation of Liability:</strong> We shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any 
                breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes via email or through the Service. Continued use after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of your 
                jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Email: support@lintora.com</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We typically respond within 24-48 hours
                </p>
              </div>
            </section>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

