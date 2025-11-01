import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { api, getAuthToken, PricingPlan } from "@/lib/api";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  useEffect(() => {
    api.getPricingPlans()
      .then((response) => setPlans(response.plans))
      .catch((error) => console.error("Failed to load pricing:", error));
  }, []);

  const handleUpgrade = async (planId: string) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (planId === "free") {
      toast.info("You already have free access! Sign up to get started.");
      navigate("/signup");
      return;
    }

    setUpgradingPlan(planId);
    try {
      await api.upgradePlan(planId);
      toast.success(`Successfully upgraded to ${planId} plan!`);
      setTimeout(() => navigate("/review"), 1500);
    } catch (error) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="container mx-auto px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your code review needs. All plans include our powerful AI analysis.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div key={plan.id} variants={item}>
              <Card
                className={`p-8 relative overflow-hidden ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg gradient-primary">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      {plan.interval === "once" ? "one-time" : `/${plan.interval}`}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    {plan.reviews === -1 ? (
                      <span className="text-primary font-semibold">
                        ♾️ Unlimited reviews
                      </span>
                    ) : (
                      <span>
                        <strong>{plan.reviews.toLocaleString()}</strong> code reviews
                        {plan.interval !== "once" && ` per ${plan.interval}`}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgradingPlan === plan.id}
                  className={`w-full ${
                    plan.popular ? "gradient-primary" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {upgradingPlan === plan.id ? (
                    "Processing..."
                  ) : plan.id === "free" ? (
                    "Get Started Free"
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">🔒 Is my code private?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Your code is analyzed using a local LLM (Ollama) and never leaves your machine. 
                We prioritize privacy and security.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">💳 Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! No long-term commitments. Cancel anytime and you'll retain access 
                until the end of your billing period.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">🚀 What if I need more reviews?</h3>
              <p className="text-sm text-muted-foreground">
                You can upgrade your plan at any time. Enterprise plan offers unlimited reviews 
                for teams with high-volume needs.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">🤖 What languages are supported?</h3>
              <p className="text-sm text-muted-foreground">
                We support 20+ programming languages including JavaScript, TypeScript, Python, 
                Java, C++, Go, Rust, and more.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-20"
        >
          <Card className="p-12 gradient-primary text-primary-foreground max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Improve Your Code Quality?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Join thousands of developers using AI-powered code reviews
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/signup")}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/review")}
              >
                Try Demo
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;

