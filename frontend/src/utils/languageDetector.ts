// Auto-detect programming language from code

export function detectLanguage(code: string): string {
  if (!code.trim()) return "javascript";

  // C++
  if (
    code.includes("#include") &&
    (code.includes("<iostream>") || code.includes("<stdio.h>") || code.includes("using namespace"))
  ) {
    return "cpp";
  }

  // C
  if (code.includes("#include") && code.includes("<stdio.h>") && !code.includes("using namespace")) {
    return "c";
  }

  // Java
  if (
    code.includes("public class") ||
    code.includes("public static void main") ||
    code.includes("System.out.println")
  ) {
    return "java";
  }

  // Python
  if (
    code.match(/^def\s+\w+\s*\(/m) ||
    code.includes("import ") ||
    code.includes("print(") ||
    code.includes("if __name__")
  ) {
    return "python";
  }

  // TypeScript
  if (
    code.includes("interface ") ||
    code.includes("type ") ||
    code.match(/:\s*(string|number|boolean|any)\s*[;=\)]/m)
  ) {
    return "typescript";
  }

  // JavaScript/JSX
  if (
    code.includes("function ") ||
    code.includes("const ") ||
    code.includes("let ") ||
    code.includes("var ") ||
    code.includes("=>") ||
    code.includes("console.log")
  ) {
    if (code.includes("React") || code.includes("jsx") || code.includes("<") && code.includes("/>")) {
      return "javascript"; // JSX is handled as JavaScript
    }
    return "javascript";
  }

  // C#
  if (
    code.includes("using System") ||
    code.includes("namespace ") ||
    code.includes("Console.WriteLine")
  ) {
    return "csharp";
  }

  // PHP
  if (code.includes("<?php") || code.includes("$_GET") || code.includes("echo ")) {
    return "php";
  }

  // Ruby
  if (
    code.includes("def ") &&
    (code.includes("end") || code.includes("puts ") || code.includes("require "))
  ) {
    return "ruby";
  }

  // Go
  if (code.includes("package main") || code.includes("func main()") || code.includes("import (")) {
    return "go";
  }

  // Rust
  if (code.includes("fn main()") || code.includes("let mut ") || code.includes("println!")) {
    return "rust";
  }

  // Default to JavaScript
  return "javascript";
}

export function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
  };
  return labels[language] || language;
}


