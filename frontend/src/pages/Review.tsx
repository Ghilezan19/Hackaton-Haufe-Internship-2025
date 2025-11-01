import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CodeInput } from "@/components/review/CodeInput";
import { AnalysisOptions } from "@/components/review/AnalysisOptions";
import { ChatResults } from "@/components/review/ChatResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Upload, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api, CodeReviewResponse, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { detectLanguage } from "@/utils/languageDetector";

const Review = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [filename, setFilename] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [analysisTypes, setAnalysisTypes] = useState<string[]>([
    "security",
    "quality",
    "performance",
    "architecture",
    "testing",
    "documentation",
  ]);
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CodeReviewResponse | null>(null);
  const [activeTab, setActiveTab] = useState("code");
  const [errorLines, setErrorLines] = useState<number[]>([]);
  const [correctedLines, setCorrectedLines] = useState<number[]>([]);
  const [isCorrected, setIsCorrected] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login to use code review");
      navigate("/login");
    }
  }, [navigate]);

  // Auto-detect language when code changes
  useEffect(() => {
    if (code.trim().length > 10) {
      const detectedLang = detectLanguage(code);
      if (detectedLang !== language) {
        setLanguage(detectedLang);
      }
    }
  }, [code]); // Only depend on code, not language to avoid loops

  const handleAnalyze = async () => {
    if (activeTab === "code" && !code.trim()) {
      toast.error("Please enter code to analyze");
      return;
    }

    if (activeTab === "file" && !file) {
      toast.error("Please upload a file to analyze");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setIsCorrected(false); // Reset corrected state on new analysis

    try {
      let response: CodeReviewResponse;

      if (activeTab === "code") {
        response = await api.reviewCode({
          code,
          language,
          filename: filename || `untitled.${language}`,
          analysisTypes,
          guidelines,
        });
      } else {
        response = await api.reviewFile(file!, analysisTypes, guidelines);
      }

      setResults(response);
      const subscription = (response as any).subscription;
      if (subscription) {
        const reviewsMsg = subscription.reviewsLeft === -1 
          ? "unlimited reviews remaining" 
          : `${subscription.reviewsLeft} reviews remaining`;
        toast.success(`Analysis complete! Found ${response.findings.length} issues. (${reviewsMsg})`);
      } else {
        toast.success(`Analysis complete! Found ${response.findings.length} issues.`);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              {t("review.title") || "Code Review"}
            </h1>
            <p className="text-muted-foreground">
              {t("review.subtitle") || "AI-powered code analysis using local LLM"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Code Input */}
            <div className="space-y-4">
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Paste Code
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code">
                    <CodeInput
                      code={code}
                      setCode={setCode}
                      language={language}
                      setLanguage={setLanguage}
                      filename={filename}
                      setFilename={setFilename}
                      errorLines={errorLines}
                      correctedLines={correctedLines}
                      isCorrected={isCorrected}
                    />
                  </TabsContent>

                  <TabsContent value="file">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">
                            {file ? file.name : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supported: JS, TS, Python, Java, C, C++, and more
                          </p>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Analyze Code
                      </>
                    )}
                  </Button>
                </div>

                {/* Collapsible Options */}
                {!results && (
                  <div className="mt-4">
                    <AnalysisOptions
                      analysisTypes={analysisTypes}
                      setAnalysisTypes={setAnalysisTypes}
                      guidelines={guidelines}
                      setGuidelines={setGuidelines}
                    />
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Chat Interface */}
            <div className="space-y-4">
              <Card className="p-6 h-full min-h-[600px] flex flex-col">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Assistant
                </h3>
                
                {!results && !isAnalyzing && (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div className="text-muted-foreground space-y-2">
                      <p className="text-sm">👈 Paste your code on the left</p>
                      <p className="text-xs">I'll analyze it and tell you what's wrong!</p>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Analyzing your code...</p>
                    </div>
                  </div>
                )}

                {results && (
                  <div className="flex-1 overflow-y-auto">
                    <ChatResults 
                      results={results} 
                      code={activeTab === "code" ? code : ""} 
                      language={language}
                      onErrorLines={(lines) => {
                        setErrorLines(lines);
                        setCorrectedLines([]); // Clear corrected lines on new analysis
                      }}
                      onCorrectedLines={(lines) => {
                        setCorrectedLines(lines);
                        setErrorLines([]); // Clear error lines after fix
                      }}
                      onFixCode={(fixedCode) => {
                        setCode(fixedCode);
                        setIsCorrected(true); // Mark code as corrected
                        toast.success("Code has been fixed in the editor! 🎉");
                      }}
                    />
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Review;

