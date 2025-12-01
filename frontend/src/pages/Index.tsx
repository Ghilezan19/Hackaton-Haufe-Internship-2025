import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, FileSearch, CheckCircle2, ArrowRight, Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const cardHover = {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Badge with shimmer */}
          <motion.div variants={item} className="inline-block mb-6">
            <div className="relative px-4 py-1.5 bg-accent/50 rounded-full text-sm font-medium text-accent-foreground overflow-hidden">
              <div className="absolute inset-0 animate-shimmer" />
              <span className="relative">✨ {t("hero.badge")}</span>
            </div>
          </motion.div>

          {/* Staggered Headline */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-4"
            variants={item}
          >
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              {t("hero.title")}
              <br />
              {t("hero.titleLine2")}
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <motion.div
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 30px rgba(66, 153, 225, 0.4), 0 0 60px rgba(66, 153, 225, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="gradient-primary group" onClick={() => navigate('/review')}>
                {t("hero.startFreeReview")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, borderColor: "hsl(var(--primary))" }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" variant="outline">
                {t("hero.viewDemo")}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { value: "10K+", label: t("stats.reviewsCompleted"), color: "text-primary" },
            { value: "95%", label: t("stats.issuesDetected"), color: "text-success" },
            { value: "50%", label: t("stats.timeSaved"), color: "text-warning" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={cardHover}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-200 hover:shadow-medium">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("features.title")}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: t("features.security.title"),
              description: t("features.security.description"),
              color: "primary",
            },
            {
              icon: Code2,
              title: t("features.quality.title"),
              description: t("features.quality.description"),
              color: "success",
            },
            {
              icon: Zap,
              title: t("features.performance.title"),
              description: t("features.performance.description"),
              color: "warning",
            },
            {
              icon: FileSearch,
              title: t("features.architecture.title"),
              description: t("features.architecture.description"),
              color: "error",
            },
            {
              icon: CheckCircle2,
              title: t("features.testing.title"),
              description: t("features.testing.description"),
              color: "primary",
            },
            {
              icon: Zap,
              title: t("features.fixes.title"),
              description: t("features.fixes.description"),
              color: "success",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={cardHover}
            >
              <Card className="p-6 border-border/50 hover:border-primary/50 transition-all duration-250 hover:shadow-medium group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-transparent transition-all duration-300" />
                <div className="relative">
                  <div className={`h-12 w-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 sm:p-8 md:p-12 gradient-primary text-primary-foreground border-0 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-20" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("cta.title")}</h2>
              <p className="text-sm sm:text-base text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                {t("cta.subtitle")}
              </p>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" variant="secondary" className="shadow-large" onClick={() => navigate('/review')}>
                  {t("cta.button")}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
