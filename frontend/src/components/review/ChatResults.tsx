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

  // AI Overview message - Per total cum e codul
  const totalIssues = results.summary.totalFindings;
  const criticalCount = results.summary.critical + results.summary.high;
  const score = results.summary.overallScore;
  
  let overviewMessage = "";
  if (totalIssues === 0) {
    overviewMessage = "🎉 Code looks great! No issues found. Score: 100/100";
  } else if (score >= 80) {
    overviewMessage = `📊 Overview: Code is generally good (score ${score}/100), but found ${totalIssues} things to improve${criticalCount > 0 ? `, including ${criticalCount} critical ones` : ''}.`;
  } else if (score >= 60) {
    overviewMessage = `📊 Overview: Code works (score ${score}/100), but has ${totalIssues} issues${criticalCount > 0 ? `, including ${criticalCount} critical` : ''} that need fixing.`;
  } else {
    overviewMessage = `⚠️ Overview: Code has serious problems (score ${score}/100). Found ${totalIssues} issues, ${criticalCount} of them critical. Needs fixing!`;
  }

  messages.push({
    type: "ai",
    content: overviewMessage,
  });

  // Separator message
  if (totalIssues > 0) {
    messages.push({
      type: "ai", 
      content: "Let's review each issue:",
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
    
    const lineInfo = finding.lineStart ? `Line ${finding.lineStart}` : "Code";
    
    let simpleMessage = `${icon} ${lineInfo}: ${finding.description}`;
    
    if (finding.recommendation) {
      simpleMessage += `\n\n💡 ${finding.recommendation}`;
    }
    
    messages.push({
      type: "ai",
      content: simpleMessage,
      finding: finding,
    });
  });

  // Detailed Summary - Final Report
  if (totalIssues > 0) {
    messages.push({
      type: "ai",
      content: "📋 **Summary Report:**",
    });

    // Create detailed summary by category
    let detailedSummary = `**Total Issues Found: ${totalIssues}**\n\n`;
    
    if (criticalFindings.length > 0) {
      detailedSummary += `🔴 **Critical/High Severity:** ${criticalFindings.length + highFindings.length} issues\n`;
      detailedSummary += criticalFindings.concat(highFindings).map((f, i) => 
        `   ${i + 1}. ${f.title || f.description.split('.')[0]} (Line ${f.lineStart || 'N/A'})`
      ).join('\n') + '\n\n';
    }
    
    if (mediumFindings.length > 0) {
      detailedSummary += `🟡 **Medium Severity:** ${mediumFindings.length} issues\n`;
      detailedSummary += mediumFindings.slice(0, 3).map((f, i) => 
        `   ${i + 1}. ${f.title || f.description.split('.')[0]}`
      ).join('\n');
      if (mediumFindings.length > 3) {
        detailedSummary += `\n   ... and ${mediumFindings.length - 3} more`;
      }
      detailedSummary += '\n\n';
    }
    
    if (lowFindings.length > 0) {
      detailedSummary += `🔵 **Low/Info:** ${lowFindings.length} suggestions\n\n`;
    }

    // Analysis types summary
    const typeGroups = results.findings.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    detailedSummary += `**Issues by Category:**\n`;
    Object.entries(typeGroups).forEach(([type, count]) => {
      const icon = type === 'security' ? '🛡️' : type === 'performance' ? '⚡' : 
                   type === 'quality' ? '✨' : type === 'testing' ? '🧪' : '📝';
      detailedSummary += `${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}\n`;
    });

    messages.push({
      type: "ai",
      content: detailedSummary,
    });
  }

  // Final Score Message
  let summaryMessage = "";
  if (score >= 90) {
    summaryMessage = `🌟 **Final Score: ${score}/100** - Excellent code! Just minor optimizations needed.`;
  } else if (score >= 70) {
    summaryMessage = `✅ **Final Score: ${score}/100** - Good code! A few improvements will make it perfect.`;
  } else if (score >= 50) {
    summaryMessage = `⚠️ **Final Score: ${score}/100** - Needs improvements. Fix critical issues first.`;
  } else {
    summaryMessage = `🚨 **Final Score: ${score}/100** - Needs urgent attention! Prioritize critical issues.`;
  }

  messages.push({
    type: "ai",
    content: summaryMessage,
  });

  // Suggestions
  if (results.suggestions.refactoring && results.suggestions.refactoring.length > 0) {
    messages.push({
      type: "ai",
      content: "💡 **My Recommendations:**\n" + results.suggestions.refactoring.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n'),
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
    toast.loading("Generating fixed code...", { id: "fix-code" });
    
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
      
      toast.success("Code fixed! 🎉", { id: "fix-code" });
    } catch (error) {
      console.error("Error fixing code:", error);
      toast.error("Fix error. Try again.", { id: "fix-code" });
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
          ⚡ Analyzed in {(results.metrics.analysisTime / 1000).toFixed(1)}s • {results.metrics.tokensUsed.toLocaleString()} tokens
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
                Generating fix...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Fix all issues?
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

