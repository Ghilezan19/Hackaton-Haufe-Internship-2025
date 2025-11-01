import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeReviewResponse, Finding } from "@/lib/api";
import {
  AlertTriangle,
  Info,
  Shield,
  Code2,
  Zap,
  FileSearch,
  CheckCircle2,
  FileText,
  Clock,
  Coins,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ReviewResultsProps {
  results: CodeReviewResponse;
  code: string;
  language: string;
}

const SEVERITY_CONFIG = {
  critical: { color: "text-red-500", bgColor: "bg-red-500/10", label: "Critical", icon: AlertTriangle },
  high: { color: "text-orange-500", bgColor: "bg-orange-500/10", label: "High", icon: AlertTriangle },
  medium: { color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Medium", icon: Info },
  low: { color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Low", icon: Info },
  info: { color: "text-gray-500", bgColor: "bg-gray-500/10", label: "Info", icon: Info },
};

const TYPE_ICONS = {
  security: Shield,
  quality: Code2,
  performance: Zap,
  architecture: FileSearch,
  testing: CheckCircle2,
  documentation: FileText,
};

export const ReviewResults = ({ results, code, language }: ReviewResultsProps) => {
  const [generatingFix, setGeneratingFix] = useState<string | null>(null);
  const [fixes, setFixes] = useState<Record<string, string>>({});

  const { summary, findings, suggestions, metrics } = results;

  const handleGenerateFix = async (finding: Finding) => {
    setGeneratingFix(finding.id);
    try {
      const response = await api.generateFix(code, finding, language);
      setFixes({ ...fixes, [finding.id]: response.fix });
      toast.success("Auto-fix generated!");
    } catch (error) {
      toast.error("Failed to generate fix");
    } finally {
      setGeneratingFix(null);
    }
  };

  const scoreColor =
    summary.overallScore >= 80
      ? "text-green-500"
      : summary.overallScore >= 60
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className={`text-4xl font-bold ${scoreColor} mb-2`}>
            {summary.overallScore}
          </div>
          <div className="text-sm text-muted-foreground">Overall Score</div>
          <Progress value={summary.overallScore} className="mt-3" />
        </Card>

        <Card className="p-6 text-center">
          <div className="text-4xl font-bold mb-2">{summary.totalFindings}</div>
          <div className="text-sm text-muted-foreground">Total Issues</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-xl font-semibold">{(metrics.analysisTime / 1000).toFixed(2)}s</div>
          </div>
          <div className="text-sm text-muted-foreground">Analysis Time</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <div className="text-xl font-semibold">{metrics.tokensUsed.toLocaleString()}</div>
          </div>
          <div className="text-sm text-muted-foreground">Tokens Used</div>
        </Card>
      </div>

      {/* Severity Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Severity Breakdown
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(summary)
            .filter(([key]) => key !== "totalFindings" && key !== "overallScore")
            .map(([severity, count]) => {
              const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
              return (
                <div key={severity} className="text-center">
                  <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{severity}</div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Findings */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Findings ({findings.length})
        </h3>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
          </TabsList>

          {["all", "critical", "high", "medium", "low"].map((severity) => (
            <TabsContent key={severity} value={severity}>
              <Accordion type="single" collapsible className="w-full">
                {findings
                  .filter((f) => severity === "all" || f.severity === severity)
                  .map((finding, index) => {
                    const severityConfig = SEVERITY_CONFIG[finding.severity];
                    const TypeIcon = TYPE_ICONS[finding.type as keyof typeof TYPE_ICONS];
                    const SeverityIcon = severityConfig.icon;

                    return (
                      <AccordionItem key={finding.id} value={finding.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 w-full text-left">
                            <div className={`p-2 rounded ${severityConfig.bgColor}`}>
                              <SeverityIcon className={`h-4 w-4 ${severityConfig.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{finding.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <TypeIcon className="h-3 w-3 mr-1" />
                                  {finding.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {severityConfig.label}
                                </Badge>
                                {finding.lineStart && (
                                  <span className="text-xs text-muted-foreground">
                                    Line {finding.lineStart}
                                    {finding.lineEnd && finding.lineEnd !== finding.lineStart
                                      ? `-${finding.lineEnd}`
                                      : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-14 pr-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{finding.description}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">Recommendation</h4>
                              <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                            </div>

                            {finding.effortEstimate && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Effort Estimate</h4>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {finding.effortEstimate.time}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {finding.effortEstimate.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {code && (
                              <div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateFix(finding)}
                                  disabled={generatingFix === finding.id}
                                  variant="outline"
                                >
                                  {generatingFix === finding.id
                                    ? "Generating..."
                                    : "Generate Auto-Fix"}
                                </Button>

                                {fixes[finding.id] && (
                                  <div className="mt-3">
                                    <h4 className="font-medium text-sm mb-2">Suggested Fix</h4>
                                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                      <code>{fixes[finding.id]}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Suggestions */}
      {(suggestions.documentation?.length ||
        suggestions.tests?.length ||
        suggestions.refactoring?.length) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Additional Suggestions</h3>
          <Tabs defaultValue="refactoring" className="w-full">
            <TabsList>
              {suggestions.refactoring?.length && (
                <TabsTrigger value="refactoring">Refactoring</TabsTrigger>
              )}
              {suggestions.tests?.length && <TabsTrigger value="tests">Tests</TabsTrigger>}
              {suggestions.documentation?.length && (
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              )}
            </TabsList>

            {suggestions.refactoring?.length && (
              <TabsContent value="refactoring">
                <ul className="list-disc list-inside space-y-2">
                  {suggestions.refactoring.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )}

            {suggestions.tests?.length && (
              <TabsContent value="tests">
                <ul className="list-disc list-inside space-y-2">
                  {suggestions.tests.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )}

            {suggestions.documentation?.length && (
              <TabsContent value="documentation">
                <ul className="list-disc list-inside space-y-2">
                  {suggestions.documentation.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      )}
    </motion.div>
  );
};

