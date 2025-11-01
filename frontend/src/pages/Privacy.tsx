import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
  const highlights = [
    {
      icon: Shield,
      title: "Your Code Stays Local",
      description: "100% local processing. Your code never leaves your machine.",
    },
    {
      icon: Lock,
      title: "Encrypted Storage",
      description: "All account data is encrypted and securely stored.",
    },
    {
      icon: Eye,
      title: "No Code Tracking",
      description: "We don't track, store, or analyze the code you review.",
    },
  ];

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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          {/* Privacy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-6">
                  <highlight.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                1. Information We Collect
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
                  <p>When you create an account, we collect:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Email address</li>
                    <li>Full name</li>
                    <li>Password (encrypted with bcrypt)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                  <p>We collect anonymous usage statistics:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Number of reviews performed</li>
                    <li>Analysis time and performance metrics</li>
                    <li>Language of code analyzed (e.g., "JavaScript")</li>
                    <li>Token usage for cost tracking</li>
                  </ul>
                  <p className="mt-2 text-sm italic">
                    ⚠️ Important: We do NOT collect, store, or transmit the actual code content you analyze.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">What We DON'T Collect</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your source code content</li>
                    <li>Code review results</li>
                    <li>File names or directory structures</li>
                    <li>IP addresses (beyond server logs)</li>
                    <li>Browsing history or cookies for tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Manage your account and subscription</li>
                <li>Send important updates and notifications</li>
                <li>Improve our Service based on anonymous usage patterns</li>
                <li>Enforce usage limits based on your subscription plan</li>
                <li>Respond to support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                3. How We Protect Your Information
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Local Processing</h3>
                  <p>
                    All code analysis happens locally on your machine using Ollama. Your code is 
                    never sent to our servers or any third-party service. This is our core privacy guarantee.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Data Encryption</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Passwords are hashed with bcrypt (10 salt rounds)</li>
                    <li>Database connections use encrypted channels</li>
                    <li>JWT tokens for secure authentication</li>
                    <li>HTTPS/TLS for all data in transit</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Access Controls</h3>
                  <p>
                    Only authorized personnel have access to user data, and only for legitimate 
                    support and maintenance purposes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-muted-foreground mb-4">
                <strong>We do NOT sell or share your data.</strong> Period.
              </p>
              <p className="text-muted-foreground mb-4">
                We may disclose information only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Legal Requirements:</strong> If required by law or legal process</li>
                <li><strong>Service Providers:</strong> Trusted partners who help operate our Service 
                (e.g., MongoDB Atlas for database hosting) under strict confidentiality agreements</li>
                <li><strong>Business Transfer:</strong> In the event of a merger or acquisition, 
                with notification to users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                5. Your Rights
              </h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to processing of your data</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                To exercise these rights, contact us at privacy@lintora.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use minimal cookies and local storage:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Authentication Token:</strong> Stored in localStorage to keep you logged in</li>
                <li><strong>Theme Preference:</strong> Remember your dark/light mode choice</li>
                <li><strong>Language Preference:</strong> Remember your selected language</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do NOT use tracking cookies, analytics cookies, or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Account Data:</strong> Retained while your account is active</p>
                <p><strong>Usage Statistics:</strong> Retained for 12 months for service improvement</p>
                <p><strong>After Account Deletion:</strong> All personal data is permanently deleted 
                within 30 days, except where required by law</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for users under 13 years of age. We do not knowingly 
                collect information from children. If you believe we have collected data from a 
                child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. International Users</h2>
              <p className="text-muted-foreground">
                Your information may be transferred and stored on servers in different countries. 
                By using our Service, you consent to this transfer. We ensure appropriate safeguards 
                are in place to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by email or through a notice on our website. Continued use of 
                the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                11. Contact Us
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices:
              </p>
              <div className="p-6 bg-muted rounded-lg space-y-2">
                <p className="font-medium">Email: privacy@lintora.com</p>
                <p className="font-medium">Support: support@lintora.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  We're committed to resolving privacy concerns quickly and transparently.
                </p>
              </div>
            </section>

            <section className="border-t pt-8">
              <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Our Privacy Commitment
                </h3>
                <p className="text-sm text-muted-foreground">
                  At Lintora, privacy isn't just a policy—it's the foundation of our product. 
                  We built our Service with local AI specifically to ensure your code never leaves 
                  your machine. We don't want your code, we don't need your code, and we've 
                  architected our system so we can't see your code. Your trust is our most valuable asset.
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

export default Privacy;

