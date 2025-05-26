# InterviewSense 

**AI-Powered Interview Preparation Platform**

InterviewSense is an AI-powered interview preparation platform that helps job seekers ace their interviews through personalized mock interviews, resume optimization, and technical assessments. The platform leverages advanced AI technology to provide real-time feedback on behavioral responses, technical skills evaluation, and automated cover letter generation, targeting the growing market of professionals seeking competitive interview preparation tools.

## Features

### Core Features
- **AI-Powered Mock Interviews**: Personalized behavioral interview practice with STAR method feedback
- **Technical Assessments**: LeetCode-style coding challenges with real-time evaluation
- **Resume Optimization**: AI-driven resume analysis and improvement suggestions
- **Cover Letter Generation**: Automated, tailored cover letters for job applications
- **Speech Analysis**: Real-time audio processing with sentiment analysis and feedback
### Security & Authentication
- **Multi-Provider Authentication**: Google OAuth, email/password, and secure session management
- **Email Verification**: Secure account verification system
- **Rate Limiting**: Advanced protection (5 requests/hour for signup, 3/15min for password resets)
- **Password Reset**: Secure token-based password recovery
- **Protected Routes**: Role-based access control

### User Experience
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Design**: Mobile-first, cross-platform compatibility
- **Real-time Feedback**: Instant AI analysis and suggestions
- **Progress Tracking**: Comprehensive dashboard with analytics
- **Microphone Integration**: Browser-based audio recording and analysis

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: React 18 with hooks
- **Authentication**: NextAuth.js v4
- **Animations**: Framer Motion
- **Icons**: Lucide React, React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth with Prisma adapter
- **Database ORM**: Prisma
- **File Processing**: Formidable, Mammoth (Word docs), PDF-lib
- **Email**: Nodemailer with custom SMTP

### Database & Infrastructure
- **Database**: PostgreSQL (Neon Cloud)
- **Deployment**: Vercel-ready configuration
- **Caching**: Redis (ioredis)
- **Rate Limiting**: Custom implementation with Redis

### AI & Machine Learning
- **Primary AI**: InterviewSense Custom AI
- **Speech Processing**: Browser MediaRecorder API
- **Future Integration**: AssemblyAI for advanced speech-to-text

### Development Tools
- **Code Quality**: Biome (linting & formatting)
- **Type Checking**: TypeScript with strict configuration
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm/bun compatible

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- Google Cloud Console account (for OAuth)
- Email service (SMTP credentials)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/interview-sense.git
cd interview-sense
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```bash
# Authentication
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/interview_sense"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_SERVER_HOST="your-smtp-host"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="your-email@domain.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="your-email@domain.com"

# AI APIs
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
ASSEMBLYAI_API_KEY="your-assemblyai-key" # Optional
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed database
npm run db:seed
```

### 5. Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/signout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Core Features
- `POST /api/behavioral-interview` - AI behavioral interview analysis
- `POST /api/technical-assessment` - Technical coding assessment
- `POST /api/resume-check` - Resume analysis and optimization
- `POST /api/generate-cover-letter` - AI cover letter generation
- `POST /api/contact` - Contact form submission

### User Management
- `GET /api/user/profile` - User profile data
- `PUT /api/user/profile` - Update user profile
- `POST /api/welcome-email` - Send welcome email



## Development

### Code Quality
```bash
# Lint and format code
npm run lint

# Format code only
npm run format

# Type checking
npx tsc --noEmit
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name your-migration-name
```

### Build for Production
```bash
npm run build
npm run start
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── interview/         # Interview modules
│   │   └── ...
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility libraries
│   └── middleware.ts          # Route protection
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── docs/                      # Documentation
└── ...config files
```

## Key Features Explained

### AI-Powered Behavioral Interviews
- Real-time speech-to-text conversion
- STAR method evaluation
- Sentiment analysis and feedback
- Personalized improvement suggestions

### Technical Assessments
- LeetCode-style coding problems
- Multiple programming languages support
- Real-time code execution and validation
- Detailed performance analytics

### Resume Optimization
- AI-driven content analysis
- Industry-specific suggestions
- ATS optimization recommendations
- Format and structure improvements

### Advanced Security
- CSRF protection
- Rate limiting by IP and user
- Secure session management
- Input validation and sanitization

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker (Alternative)
```bash
# Build Docker image
docker build -t interview-sense .

# Run container
docker run -p 3000:3000 interview-sense
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use Biome for code formatting
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## Support

- **Email**: support@interviewsense.org
- **Documentation**: Check the `/docs` folder
- **Issues**: Open a GitHub issue

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Interview Sense Agent for AI capabilities
- Vercel for deployment platform
- Neon for PostgreSQL hosting
- OpenAI for inspiration and research
- shadcn/ui for beautiful components

---



