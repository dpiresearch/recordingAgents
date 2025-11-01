# Contributing Guide 🤝

Thank you for your interest in contributing to the Voice Recording & AI Analysis app!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/recordingAgents.git
   cd recordingAgents
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY
   ```
5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

```bash
# For new features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-changed
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 3. Test Locally

```bash
# Run the dev server
npm run dev

# Build to check for errors
npm run build

# Run linter
npm run lint
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: Add new feature"
# or
git commit -m "fix: Fix bug in transcription"
# or
git commit -m "docs: Update README"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then go to GitHub and create a Pull Request.

## Code Style Guidelines

### TypeScript

```typescript
// Use TypeScript types
interface AudioData {
  blob: Blob
  duration: number
}

// Use async/await instead of .then()
async function transcribe(audio: Blob): Promise<string> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: audio,
  })
  return response.json()
}

// Handle errors properly
try {
  const result = await processAudio()
} catch (error) {
  console.error('Processing failed:', error)
  // Show user-friendly error
}
```

### React

```typescript
// Use functional components
export default function Component() {
  // Use hooks
  const [state, setState] = useState<string>('')
  
  // Extract complex logic
  const handleClick = useCallback(() => {
    // logic here
  }, [dependencies])
  
  return <div>...</div>
}
```

### CSS

```css
/* Use module.css for components */
/* Use descriptive class names */
.recordButton {
  /* Properties in logical order */
  display: flex;
  padding: 1rem;
  background: gradient(...);
}

/* Mobile-first approach */
@media (max-width: 768px) {
  .recordButton {
    padding: 0.5rem;
  }
}
```

## Project Structure

```
recordingAgents/
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── transcribe/   # Whisper endpoint
│   │   ├── agents/       # AI agent endpoints
│   │   └── stripe/       # Payment endpoints
│   ├── page.tsx          # Main page (frontend)
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── public/               # Static assets (if needed)
├── .env.example          # Environment template
└── documentation/        # Documentation files
```

## Adding New Features

### Adding a New AI Agent

1. Create agent endpoint:
   ```typescript
   // app/api/agents/your-agent/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   import OpenAI from 'openai'
   
   export async function POST(request: NextRequest) {
     // Your agent logic
   }
   ```

2. Update frontend to call agent:
   ```typescript
   // app/page.tsx
   const yourAgentRes = await fetch('/api/agents/your-agent', {
     method: 'POST',
     body: JSON.stringify({ transcription }),
   })
   ```

3. Display results in UI

### Adding New UI Components

1. Create component file
2. Add styles in module.css
3. Import and use in page.tsx
4. Test responsiveness

## Testing

### Manual Testing Checklist

- [ ] Recording works in Chrome, Safari, Firefox
- [ ] Transcription is accurate
- [ ] All agents return results
- [ ] UI is responsive on mobile
- [ ] Error handling works
- [ ] Loading states are clear
- [ ] No console errors

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Documentation

When adding features:
- Update README.md if needed
- Add JSDoc comments
- Update API documentation
- Add examples

## Pull Request Guidelines

### PR Title Format

```
feat: Add emotion detection agent
fix: Resolve microphone permission issue
docs: Update deployment instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing Done
- [ ] Tested locally
- [ ] Tested in multiple browsers
- [ ] Checked responsive design
- [ ] Verified no console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Notes
Any additional information
```

### Review Process

1. Submit PR
2. Automated checks run
3. Code review by maintainer
4. Address feedback
5. Merge when approved

## Common Tasks

### Adding a New Dependency

```bash
npm install package-name
# or
npm install -D package-name  # for dev dependencies
```

Update documentation if it affects setup.

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Debugging

```typescript
// Server-side (API routes)
console.log('Debug:', data)  // Shows in terminal

// Client-side (React components)
console.log('Debug:', data)  // Shows in browser console
```

Use browser DevTools (F12) for:
- Console logs
- Network requests
- React components (with React DevTools)
- Performance profiling

## Code Review Criteria

Reviewers will check:
- [ ] Code follows project style
- [ ] TypeScript types are used
- [ ] Error handling is proper
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Documentation is updated
- [ ] Changes are tested

## Security

- Never commit API keys
- Never commit `.env` file
- Report security issues privately
- Follow security best practices in SECURITY.md

## Questions?

- Check existing issues on GitHub
- Read documentation (README.md, SETUP.md, etc.)
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Appreciated in community

Thank you for contributing! 🎉

