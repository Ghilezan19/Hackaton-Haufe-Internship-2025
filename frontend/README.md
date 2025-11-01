# Lintora Frontend

Beautiful, modern React frontend for the AI-powered code review assistant.

## Tech Stack

- ⚛️ **React 18** - Modern React with hooks
- 📘 **TypeScript** - Type-safe development
- ⚡ **Vite** - Lightning-fast build tool
- 🎨 **Tailwind CSS** - Utility-first styling
- 🎭 **ShadCN UI** - Beautiful, accessible components
- 🎬 **Framer Motion** - Smooth animations
- 🌍 **i18next** - Multi-language support (EN, DE, FR, RO)
- 🌓 **next-themes** - Dark/Light mode
- 🔍 **React Query** - Data fetching and caching

## Features

### 🎨 Beautiful UI
- Modern gradient designs
- Smooth animations with Framer Motion
- Responsive design for all devices
- Dark/Light theme toggle
- Multi-language support

### 📝 Code Review Interface
- **Paste Code** - Quick analysis of code snippets
- **Upload Files** - Analyze entire code files
- **Real-time Analysis** - Live feedback from local LLM
- **Interactive Results** - Expandable findings with details

### 📊 Rich Analysis Display
- Overall quality score (0-100)
- Severity breakdown (Critical, High, Medium, Low, Info)
- Detailed findings with:
  - Line numbers
  - Descriptions
  - Recommendations
  - Effort estimates
  - Auto-fix generation

### ⚙️ Customization
- Select analysis types:
  - Security
  - Code Quality
  - Performance
  - Architecture
  - Testing
  - Documentation
- Coding guidelines presets (PEP8, Google Style, Airbnb, etc.)
- Custom guideline support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # ShadCN UI components
│   │   ├── review/          # Code review components
│   │   │   ├── CodeInput.tsx
│   │   │   ├── AnalysisOptions.tsx
│   │   │   └── ReviewResults.tsx
│   │   ├── AnimatedBackground.tsx
│   │   ├── Header.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Index.tsx        # Landing page
│   │   ├── Review.tsx       # Code review page
│   │   └── NotFound.tsx
│   ├── lib/
│   │   ├── api.ts           # Backend API client
│   │   └── utils.ts         # Utility functions
│   ├── i18n/                # Internationalization
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── de.json
│   │       ├── fr.json
│   │       └── ro.json
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## Available Routes

- `/` - Landing page with features and CTA
- `/review` - Code review interface
- `*` - 404 Not Found page

## API Integration

The frontend connects to the backend API (default: `http://localhost:3000/api`).

Configure in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### API Client Usage

```typescript
import { api } from '@/lib/api';

// Review code
const result = await api.reviewCode({
  code: 'function test() {}',
  language: 'javascript',
  analysisTypes: ['security', 'quality']
});

// Review file
const file = new File(['code'], 'test.js');
const result = await api.reviewFile(file, ['security']);

// Generate auto-fix
const fix = await api.generateFix(code, finding, 'javascript');
```

## Customization

### Theme Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      // ... customize colors
    }
  }
}
```

### Add New Languages

1. Create new locale file: `src/i18n/locales/es.json`
2. Copy structure from `en.json`
3. Translate strings
4. Import in `src/i18n/config.ts`

### Custom Components

ShadCN UI components can be customized:

```bash
# Add new component
npx shadcn-ui@latest add [component-name]
```

## Performance

- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Tree Shaking** - Unused code eliminated
- **Asset Optimization** - Images and assets optimized
- **Fast Refresh** - Instant HMR in development

## Accessibility

- ♿ **WCAG 2.1** compliant
- ⌨️ **Keyboard navigation** support
- 🎯 **ARIA labels** on interactive elements
- 🔍 **Screen reader** friendly
- 🎨 **High contrast** mode support

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:8080)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Keep components small and focused
4. Add translations for new strings
5. Test in both light and dark themes

## License

MIT

