import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Code2, Zap, FileSearch, CheckCircle2, FileText, X } from "lucide-react";
import { useState } from "react";

interface AnalysisOptionsProps {
  analysisTypes: string[];
  setAnalysisTypes: (types: string[]) => void;
  guidelines: string[];
  setGuidelines: (guidelines: string[]) => void;
}

const ANALYSIS_TYPES = [
  { value: "security", label: "Security", icon: Shield, color: "text-red-500" },
  { value: "quality", label: "Code Quality", icon: Code2, color: "text-blue-500" },
  { value: "performance", label: "Performance", icon: Zap, color: "text-yellow-500" },
  { value: "architecture", label: "Architecture", icon: FileSearch, color: "text-purple-500" },
  { value: "testing", label: "Testing", icon: CheckCircle2, color: "text-green-500" },
  { value: "documentation", label: "Documentation", icon: FileText, color: "text-gray-500" },
];

const PRESET_GUIDELINES = [
  "PEP8",
  "Google Style",
  "Airbnb JavaScript",
  "ES6+",
  "SOLID Principles",
  "DRY",
  "KISS",
];

export const AnalysisOptions = ({
  analysisTypes,
  setAnalysisTypes,
  guidelines,
  setGuidelines,
}: AnalysisOptionsProps) => {
  const [customGuideline, setCustomGuideline] = useState("");

  const toggleAnalysisType = (type: string) => {
    if (analysisTypes.includes(type)) {
      setAnalysisTypes(analysisTypes.filter((t) => t !== type));
    } else {
      setAnalysisTypes([...analysisTypes, type]);
    }
  };

  const addGuideline = (guideline: string) => {
    if (!guidelines.includes(guideline)) {
      setGuidelines([...guidelines, guideline]);
    }
  };

  const removeGuideline = (guideline: string) => {
    setGuidelines(guidelines.filter((g) => g !== guideline));
  };

  const handleAddCustomGuideline = () => {
    if (customGuideline.trim()) {
      addGuideline(customGuideline.trim());
      setCustomGuideline("");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Analysis Types</h3>
        <div className="space-y-3">
          {ANALYSIS_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={analysisTypes.includes(type.value)}
                  onCheckedChange={() => toggleAnalysisType(type.value)}
                />
                <Label
                  htmlFor={type.value}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Icon className={`h-4 w-4 ${type.color}`} />
                  {type.label}
                </Label>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Coding Guidelines</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESET_GUIDELINES.map((guideline) => (
              <Badge
                key={guideline}
                variant={guidelines.includes(guideline) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  guidelines.includes(guideline)
                    ? removeGuideline(guideline)
                    : addGuideline(guideline)
                }
              >
                {guideline}
              </Badge>
            ))}
          </div>

          <div className="pt-3 border-t">
            <Label className="text-xs text-muted-foreground mb-2">Custom Guideline</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom..."
                value={customGuideline}
                onChange={(e) => setCustomGuideline(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomGuideline()}
              />
              <Button size="sm" onClick={handleAddCustomGuideline}>
                Add
              </Button>
            </div>
          </div>

          {guidelines.length > 0 && (
            <div className="pt-3 border-t">
              <Label className="text-xs text-muted-foreground mb-2">Active Guidelines</Label>
              <div className="flex flex-wrap gap-2">
                {guidelines.map((guideline) => (
                  <Badge key={guideline} variant="secondary" className="gap-1">
                    {guideline}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeGuideline(guideline)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};


