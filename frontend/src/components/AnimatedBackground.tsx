import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CodeSnippet {
  id: number;
  text: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  fontSize: number;
  rotation: number;
}

const codeSnippets = [
  "const review = async () => {...}",
  "interface Finding { severity: string }",
  "export function analyze(code: string)",
  "import { AI } from '@lovable/ai'",
  "type SecurityIssue = { ... }",
  "async function detectIssues()",
  "const findings: Finding[] = []",
  "return { status: 'success' }",
  "class CodeAnalyzer { ... }",
  "function validateSyntax()",
  "await ai.review(code)",
  "map(f => f.severity)",
  "filter(x => x.critical)",
  "Promise.all(checks)",
  "try { ... } catch (e) {}",
];

export const AnimatedBackground = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    // Generate code snippets
    const snippetCount = isMobile ? 8 : 15;
    const newSnippets: CodeSnippet[] = Array.from({ length: snippetCount }, (_, i) => ({
      id: i,
      text: codeSnippets[i % codeSnippets.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.2,
      fontSize: Math.random() * 6 + 10,
      rotation: Math.random() * 20 - 10,
    }));
    setSnippets(newSnippets);
  }, [isMobile]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Backdrop - Animated Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary-glow/10 to-accent/8 dark:from-primary/12 dark:via-primary-glow/15 dark:to-accent/10"
        animate={
          prefersReducedMotion
            ? {}
            : {
                background: [
                  "linear-gradient(135deg, hsl(217 91% 60% / 0.08), hsl(217 91% 70% / 0.10), hsl(217 91% 95% / 0.08))",
                  "linear-gradient(225deg, hsl(217 91% 70% / 0.10), hsl(217 91% 95% / 0.08), hsl(217 91% 60% / 0.08))",
                  "linear-gradient(315deg, hsl(217 91% 95% / 0.08), hsl(217 91% 60% / 0.08), hsl(217 91% 70% / 0.10))",
                  "linear-gradient(135deg, hsl(217 91% 60% / 0.08), hsl(217 91% 70% / 0.10), hsl(217 91% 95% / 0.08))",
                ],
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Texture - Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay dark:opacity-[0.08]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, currentColor 0%, currentColor 1px, transparent 1px), linear-gradient(0deg, transparent 0%, currentColor 0%, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Motive - Floating Code Snippets */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0"
          style={{
            x: springX,
            y: springY,
          }}
        >
          {snippets.map((snippet) => (
            <motion.div
              key={snippet.id}
              className="absolute font-mono whitespace-nowrap select-none"
              style={{
                left: `${snippet.x}%`,
                top: `${snippet.y}%`,
                fontSize: `${snippet.fontSize}px`,
                opacity: snippet.opacity,
                color: "hsl(var(--primary))",
                textShadow: "0 0 20px hsl(var(--primary) / 0.5)",
                filter: "blur(0.3px)",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                x: [0, 40, -30, 20, 0],
                y: [0, -50, 30, -20, 0],
                rotate: [snippet.rotation, snippet.rotation + 5, snippet.rotation - 5, snippet.rotation],
                opacity: [snippet.opacity * 0.5, snippet.opacity, snippet.opacity * 0.7, snippet.opacity],
              }}
              transition={{
                duration: snippet.duration,
                delay: snippet.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {snippet.text}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
