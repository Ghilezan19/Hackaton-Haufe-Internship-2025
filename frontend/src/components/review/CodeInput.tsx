import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  filename: string;
  setFilename: (filename: string) => void;
  errorLines?: number[];
  correctedLines?: number[];
  isCorrected?: boolean;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

export const CodeInput = ({
  code,
  setCode,
  language,
  setLanguage,
  filename,
  setFilename,
  errorLines = [],
  correctedLines = [],
  isCorrected = false,
}: CodeInputProps) => {
  const [copied, setCopied] = useState(false);

  const getLineClass = (lineNumber: number) => {
    if (correctedLines.includes(lineNumber)) {
      return "bg-green-500/20 text-green-600 dark:text-green-400 font-semibold border-l-2 border-green-500 pl-2";
    }
    if (errorLines.includes(lineNumber)) {
      return "bg-red-500/20 text-red-600 dark:text-red-400 font-semibold border-l-2 border-red-500 pl-2";
    }
    return "";
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Cod copiat! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Eroare la copiere");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filename">Filename (optional)</Label>
          <Input
            id="filename"
            placeholder="example.js"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="code">Code</Label>
          {isCorrected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copiat!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          )}
        </div>
        <div className="relative border rounded-md overflow-hidden bg-background">
          <div className="flex">
            {/* Line Numbers with highlighting */}
            <div className="flex-shrink-0 bg-muted/30 px-3 py-3 text-right select-none border-r">
              <div className="font-mono text-xs leading-6">
                {code.split('\n').map((_, i) => {
                  const lineNumber = i + 1;
                  return (
                    <div 
                      key={i}
                      className={`transition-all duration-300 ${getLineClass(lineNumber)}`}
                    >
                      {lineNumber}
                    </div>
                  );
                })}
                {!code && <div>1</div>}
              </div>
            </div>
            {/* Code Editor */}
            <Textarea
              id="code"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm border-0 focus-visible:ring-0 resize-none leading-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

