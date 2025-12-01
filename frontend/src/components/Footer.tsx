import { Link } from "react-router-dom";
import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ScoalaDeAI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Platformă educațională pentru învățarea programării cu mentoring AI, exerciții interactive și suport personalizat.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@scoaladeai.ro"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/review"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Code Review
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ollama/ollama"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Powered by Ollama
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="mailto:careers@scoaladeai.ro"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cariere
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Open Source
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:security@scoaladeai.ro"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Securitate
                </a>
              </li>
              <li>
                <a
                  href="mailto:compliance@scoaladeai.ro"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Conformitate
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} ScoalaDeAI. Construit cu ❤️ pentru elevi și profesori. Toate drepturile rezervate.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>🤖 AI Mentor</span>
            <span>📚 Învățare Interactivă</span>
            <span>⚡ Progres Rapid</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

