# Contributing to InterviewSense

Thank you for your interest in contributing to InterviewSense! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them succeed
- **Be collaborative**: Work together and share knowledge
- **Be constructive**: Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git knowledge
- Basic understanding of Next.js and TypeScript

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/InterviewSense.git
   cd InterviewSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🐛 Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates.

### Bug Report Template
- **Title**: Clear, descriptive title
- **Description**: Detailed description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

## ✨ Suggesting Features

We welcome feature suggestions! Please provide:

- **Clear description** of the feature
- **Use case** and why it's valuable
- **Possible implementation** ideas
- **Alternatives considered**

## 💻 Code Contributions

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add Google OAuth integration
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
style(components): improve button styling
refactor(api): optimize database queries
test(utils): add unit tests for validation
```

### Code Style

- **TypeScript**: Use strict mode, prefer type safety
- **Formatting**: Use Biome for consistent formatting
- **Naming**: Descriptive names (camelCase for variables, PascalCase for components)
- **Components**: Functional components with hooks
- **Comments**: Document complex logic

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/description
   ```

2. **Make changes and test**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/description
   # Open PR on GitHub
   ```

### Pull Request Requirements

- [ ] Clear description of changes
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly marked)
- [ ] Screenshots for UI changes

## 🧪 Testing

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Writing Tests
- Write tests for new features
- Test both happy path and edge cases
- Use descriptive test names
- Mock external dependencies

## 📖 Documentation

### Contributing to Docs
- Keep documentation up-to-date
- Use clear, concise language
- Include code examples
- Test documentation steps

### Documentation Structure
```
docs/
├── setup/           # Installation and setup guides
├── features/        # Feature documentation
├── api/            # API documentation
├── deployment/     # Deployment guides
└── contributing/   # Contribution guides
```

## 🔒 Security

### Reporting Security Issues
- **DO NOT** open public issues for security vulnerabilities
- Email security@interviewsense.org
- Include detailed description
- Allow time for response before disclosure

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP security practices

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority:high` - High priority
- `status:in-progress` - Currently being worked on

## 🎯 Areas for Contribution

### High Priority
- **Bug fixes**: Resolve existing issues
- **Documentation**: Improve guides and examples
- **Testing**: Increase test coverage
- **Accessibility**: Improve a11y compliance

### Medium Priority
- **New features**: Add valuable functionality
- **Performance**: Optimize loading and rendering
- **UI/UX**: Enhance user experience
- **Internationalization**: Add language support

### Ideas for Contributors
- **Mobile app**: React Native version
- **API improvements**: Better error handling
- **AI enhancements**: Better prompt engineering
- **Integration**: Third-party service integrations

## 💬 Community

### Getting Help
- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Real-time community chat (coming soon)
- **Email**: technical questions to dev@interviewsense.org

### Mentorship
- New contributors welcome!
- Experienced maintainers available for guidance
- Pair programming sessions available

## 🏆 Recognition

Contributors are recognized through:
- **GitHub Contributors**: Listed in README
- **Release Notes**: Contributions highlighted
- **Hall of Fame**: Special recognition page
- **Swag**: Stickers and shirts for significant contributors

## 📝 Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Critical fixes

### Release Process
1. Features merged to `develop`
2. Testing and QA on `develop`
3. Create release candidate
4. Merge to `main` and tag release
5. Deploy to production

Thank you for contributing to InterviewSense! 🚀
