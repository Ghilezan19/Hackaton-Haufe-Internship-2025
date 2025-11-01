import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Code2, Users, Heart, Target } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your code stays on your machine. We use local AI to ensure complete privacy and security.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant feedback with our optimized local LLM. No waiting, no API limits.",
    },
    {
      icon: Code2,
      title: "Developer Focused",
      description: "Built by developers, for developers. We understand your workflow and challenges.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Growing community of developers improving code quality together.",
    },
    {
      icon: Heart,
      title: "Open & Honest",
      description: "Transparent pricing, no hidden fees, no vendor lock-in. You own your data.",
    },
    {
      icon: Target,
      title: "Results Oriented",
      description: "Proven to catch 95% of issues and save 50% of review time.",
    },
  ];

  const team = [
    {
      name: "Development Team",
      role: "Engineering",
      description: "Building the future of code review with AI",
    },
    {
      name: "AI Research",
      role: "Machine Learning",
      description: "Training and optimizing review algorithms",
    },
    {
      name: "Product",
      role: "User Experience",
      description: "Creating intuitive developer tools",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="container mx-auto px-4 py-20 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            About Lintora
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make code review faster, smarter, and more accessible 
            to every developer, while keeping your code private and secure.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <Card className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Lintora was born from a simple frustration: waiting hours for code reviews 
                and worrying about sending proprietary code to cloud services.
              </p>
              <p>
                We believe that every developer deserves instant, high-quality feedback without 
                compromising security. That's why we built Lintora with privacy at its core, 
                using local AI that runs entirely on your machine.
              </p>
              <p>
                Today, thousands of developers trust Lintora to catch bugs, improve code quality, 
                and ship faster—all while keeping their code completely private.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <Card className="p-6 h-full">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="p-12 gradient-primary text-primary-foreground">
            <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-sm text-primary-foreground/80">Reviews Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-sm text-primary-foreground/80">Issues Detected</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50%</div>
                <div className="text-sm text-primary-foreground/80">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">20+</div>
                <div className="text-sm text-primary-foreground/80">Languages Supported</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Technology</h2>
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">🤖 Local AI (Ollama + CodeLlama)</h3>
                <p className="text-sm text-muted-foreground">
                  We use state-of-the-art large language models optimized for code analysis, 
                  running entirely on your local machine for maximum privacy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔒 Zero Cloud Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Your code never leaves your computer. All analysis happens locally, 
                  ensuring complete confidentiality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⚡ Optimized Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Fast analysis with efficient algorithms. Get results in seconds, not minutes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 Comprehensive Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-dimensional reviews covering security, performance, architecture, 
                  testing, and more.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default About;

