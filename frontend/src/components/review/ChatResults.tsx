import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeReviewResponse, api } from "@/lib/api";
import { toast } from "sonner";
import { TypewriterText } from "./TypewriterText";

interface ChatResultsProps {
  results: CodeReviewResponse;
  code: string;
  language: string;
  onErrorLines?: (lines: number[]) => void;
  onCorrectedLines?: (lines: number[]) => void;
}

interface ChatResultsPropsExtended extends ChatResultsProps {
  onFixCode?: (fixedCode: string) => void;
}

interface Message {
  type: "user" | "ai";
  content: string;
  finding?: any;
}

export const ChatResults = ({ results, code, language, onFixCode, onErrorLines, onCorrectedLines }: ChatResultsPropsExtended) => {
  const [isGeneratingFix, setIsGeneratingFix] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  
  // Build all messages
  const messages: Message[] = [];

  // User message
  messages.push({
    type: "user",
    content: "Analizează codul ăsta 👆",
  });

  // AI Overview message - Per total cum e codul
  const totalIssues = results.summary.totalFindings;
  const criticalCount = results.summary.critical + results.summary.high;
  const score = results.summary.overallScore;
  
  let overviewMessage = "";
  if (totalIssues === 0) {
    overviewMessage = "🎉 Codul arată foarte bine! Nu am găsit probleme. Scor: 100/100";
  } else if (score >= 80) {
    overviewMessage = `📊 Overview: Codul e în general bun (scor ${score}/100), dar am găsit ${totalIssues} lucruri de îmbunătățit${criticalCount > 0 ? `, dintre care ${criticalCount} sunt importante` : ''}.`;
  } else if (score >= 60) {
    overviewMessage = `📊 Overview: Codul funcționează (scor ${score}/100), dar are ${totalIssues} probleme${criticalCount > 0 ? `, inclusiv ${criticalCount} critice` : ''} care trebuie rezolvate.`;
  } else {
    overviewMessage = `⚠️ Overview: Codul are probleme serioase (scor ${score}/100). Am găsit ${totalIssues} probleme, dintre care ${criticalCount} sunt critice. Trebuie corectat!`;
  }

  messages.push({
    type: "ai",
    content: overviewMessage,
  });

  // Separator message
  if (totalIssues > 0) {
    messages.push({
      type: "ai", 
      content: "Hai să vedem fiecare problemă:",
    });
  }

  // Group findings by severity for better presentation
  const criticalFindings = results.findings.filter(f => f.severity === "critical");
  const highFindings = results.findings.filter(f => f.severity === "high");
  const mediumFindings = results.findings.filter(f => f.severity === "medium");
  const lowFindings = results.findings.filter(f => f.severity === "low" || f.severity === "info");

  // Add all findings as simple messages
  const allSortedFindings = [
    ...criticalFindings,
    ...highFindings,
    ...mediumFindings,
    ...lowFindings
  ];

  allSortedFindings.forEach((finding, index) => {
    const icon = finding.severity === "critical" || finding.severity === "high" ? "🔴" : 
                 finding.severity === "medium" ? "🟡" : "🔵";
    
    // SUPER SIMPLU - ca și cum vorbești cu un prieten
    const lineInfo = finding.lineStart ? `Linia ${finding.lineStart}` : "Cod";
    
    // Simplificare extremă a mesajului
    let simpleMessage = `${icon} ${lineInfo}: ${finding.description}`;
    
    // Adaugă fix-ul într-o propoziție simplă
    if (finding.recommendation) {
      simpleMessage += `\n\n💡 ${finding.recommendation}`;
    }
    
    messages.push({
      type: "ai",
      content: simpleMessage,
      finding: finding,
    });
  });

  // Summary message (score already declared at the top)
  let summaryMessage = "";
  if (score >= 90) {
    summaryMessage = `🌟 **Scor final: ${score}/100** - Cod excelent! Doar câteva optimizări minore.`;
  } else if (score >= 70) {
    summaryMessage = `✅ **Scor final: ${score}/100** - Cod bun! Cu câteva îmbunătățiri va fi perfect.`;
  } else if (score >= 50) {
    summaryMessage = `⚠️ **Scor final: ${score}/100** - Necesită îmbunătățiri. Rezolvă problemele critice.`;
  } else {
    summaryMessage = `🚨 **Scor final: ${score}/100** - Necesită atenție urgentă! Multe probleme de rezolvat.`;
  }

  messages.push({
    type: "ai",
    content: summaryMessage,
  });

  // Suggestions
  if (results.suggestions.refactoring && results.suggestions.refactoring.length > 0) {
    messages.push({
      type: "ai",
      content: "💡 **Sfatul meu:** " + results.suggestions.refactoring[0],
    });
  }

  // Extract error lines and send to parent
  useEffect(() => {
    if (onErrorLines) {
      const errorLines = results.findings
        .map(f => f.lineStart)
        .filter((line): line is number => line !== undefined);
      onErrorLines(errorLines);
    }
  }, [results, onErrorLines]);

  // Progressive message reveal
  useEffect(() => {
    if (visibleMessages < messages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(v => v + 1);
      }, 50); // Small delay between messages
      return () => clearTimeout(timer);
    }
  }, [visibleMessages, messages.length]);

  // Fix code handler
  const handleFixCode = async () => {
    if (!code || !onFixCode) return;
    
    setIsGeneratingFix(true);
    toast.loading("Generez codul corect...", { id: "fix-code" });
    
    try {
      // Generate complete fixed code using GPT
      const fixedCode = await api.generateCompletefix(code, language, results.findings);
      onFixCode(fixedCode);
      
      // Send corrected lines to parent for green highlighting
      if (onCorrectedLines) {
        const correctedLines = results.findings
          .map(f => f.lineStart)
          .filter((line): line is number => line !== undefined);
        onCorrectedLines(correctedLines);
      }
      
      toast.success("Cod corectat! 🎉", { id: "fix-code" });
    } catch (error) {
      console.error("Error fixing code:", error);
      toast.error("Eroare la corectare. Încearcă din nou.", { id: "fix-code" });
    } finally {
      setIsGeneratingFix(false);
    }
  };

  const visibleMessagesList = messages.slice(0, visibleMessages);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <AnimatePresence>
        {visibleMessagesList.map((message, index) => {
          const isLastMessage = index === visibleMessagesList.length - 1;
          const isAI = message.type === "ai";
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {isAI && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[85%] ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                } rounded-2xl px-4 py-3 shadow-sm`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {isAI && isLastMessage ? (
                    <p className="mb-0 text-sm leading-relaxed">
                      <TypewriterText 
                        text={message.content} 
                        delay={10}
                        onComplete={() => {
                          // Reveal next message after current one finishes
                          if (visibleMessages < messages.length) {
                            setTimeout(() => setVisibleMessages(v => v + 1), 100);
                          }
                        }}
                      />
                    </p>
                  ) : (
                    <p className="mb-0 whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>

              {message.type === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Analysis metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: messages.length * 0.1 + 0.2 }}
        className="flex justify-center"
      >
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-full px-4 py-2">
          ⚡ Analizat în {(results.metrics.analysisTime / 1000).toFixed(1)}s • {results.metrics.tokensUsed.toLocaleString()} tokens
        </div>
      </motion.div>

      {/* Fix Code Button - Only show if there are issues */}
      {totalIssues > 0 && onFixCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: messages.length * 0.1 + 0.4 }}
          className="flex justify-center pt-4"
        >
          <Button
            onClick={handleFixCode}
            disabled={isGeneratingFix}
            size="lg"
            className="gradient-primary gap-2"
          >
            {isGeneratingFix ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="h-5 w-5" />
                </motion.div>
                Generez codul corect...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Dorești corectarea codului?
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

