# Hackathon Todo Application

A professional full-stack todo application demonstrating best practices in software development, clean architecture, and Spec-Driven Development (SDD) methodology.

## Quick Links

- **Specification Documents**: See `specs/` directory
- **Agent Information**: See `AGENTS.md`
- **AI Integration Guide**: See `CLAUDE.md`
- **Frontend Setup**: See `frontend/CLAUDE.md`
- **Backend Setup**: See `backend/CLAUDE.md`

## Project Overview

### Vision
Build a comprehensive, production-ready todo application that demonstrates professional development practices, clean architecture, and specification-driven development methodology.

### Key Objectives
- Implement features in well-defined phases
- Follow Spec-Driven Development (SDD) practices
- Maintain code quality and security standards
- Build scalable and performant application
- Document all decisions and procedures

## Project Structure

```
hackathon-todo/
├── .spec-kit/              # SDD configuration
├── specs/                  # Specification documents for all phases
│   ├── overview.md         # Project overview
│   ├── architecture.md     # Architecture design
│   └── phase1-5/          # Phase-specific specs
├── frontend/               # React/Vue/Angular application
├── backend/                # Node.js/Python API
├── docs/                   # Additional documentation
├── docker-compose.yml      # Local development setup
├── .gitignore             # Git ignore rules
├── AGENTS.md              # Agent roles and responsibilities
├── CLAUDE.md              # AI assistant integration guide
└── README.md              # This file
```

### Phase 2: Core Backend API Development
Build REST API with authentication, user management, and todo operations.

**Status**: Specification phase
**Specs**: `specs/phase2/`

## Getting Started

### Prerequisites
- Node.js 18+ or Python 3.10+
- Docker 4.0+ and Docker Compose 2.0+
- Git 2.40+
- Code editor (VS Code recommended)

### Quick Start

#### Option 1: Docker (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd hackathon-todo

# Start development environment
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

#### Option 2: Local Development
```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Development Workflow

### Before Starting Development
1. Read the relevant phase specification
2. Ensure Phase prerequisites are complete
3. Understand the architecture (`specs/architecture.md`)
4. Review the SDD methodology (`AGENTS.md`)

### During Development
1. Start with Constitution/Specification documents
2. Create Implementation Plan with Task IDs
3. Implement following specifications exactly
4. Test continuously
5. Reference Task ID in commits

### Code Standards

#### Commit Message Format
```
type(scope): description TASK-ID

type: feat, fix, docs, style, refactor, test, chore
scope: auth, todos, users, etc.
description: Clear, concise description
TASK-ID: Reference to phase task (e.g., PHASE2-004)

Example:
feat(auth): implement JWT token refresh PHASE2-002
```

#### Branch Naming
```
feature/PHASE-TASK-description
bugfix/PHASE-TASK-description
docs/description

Example:
feature/PHASE2-002-jwt-refresh
```

## API Documentation

### Accessing API Docs
- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI Schema**: http://localhost:3001/api/openapi.json
- **Specification**: `specs/phase2/specify.md`

### Making API Requests
```bash
# Example: Get user profile
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/users/user-id

# See specs/phase2/specify.md for all endpoints
```

## Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Target: >80% coverage
- Focus: Critical paths and features
- Types: Unit, Integration, E2E

## Deployment

### Staging Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to staging
docker-compose -f docker-compose.staging.yml up
```

### Production Deployment
See `specs/phase5/plan.md` for deployment procedures and checklists.



## Team Guidelines

### For All Team Members
- Follow Spec-Driven Development practices
- Reference Task IDs in all work
- Write clear commit messages
- Test thoroughly before committing
- Review specifications before starting work

### For Frontend Developers
- See `frontend/CLAUDE.md` for setup and guidelines
- Follow responsive design patterns
- Ensure accessibility (WCAG 2.1 AA)
- Test on multiple browsers/devices

### For Backend Developers
- See `backend/CLAUDE.md` for setup and guidelines
- Follow REST API conventions
- Implement proper error handling
- Write comprehensive tests
- Document API changes

### For DevOps/Infrastructure
- See `specs/phase5/specify.md` for infrastructure requirements
- Maintain CI/CD pipeline
- Monitor production systems
- Manage deployments
- Document procedures

## Using AI Assistants

### Guidelines
- Read `CLAUDE.md` before using AI assistance
- Always review and test AI-generated code
- Maintain SDD practices with AI help
- Document AI-assisted code in commits

### Best Practices
- Provide specifications as context
- Include Task IDs in requests
- Review for security
- Test thoroughly
- Understand the code you commit

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up containers
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up
```

#### Database Issues
```bash
# Reset database
cd backend
npm run db:reset

# Run migrations
npm run db:migrate
```

## Performance Targets

### Backend
- API p95 response: <500ms
- API p99 response: <1000ms
- Database query: <100ms
- Concurrent users: 1000+

### Frontend
- Lighthouse score: ≥85
- Page load: <3s
- First Contentful Paint: <1s
- Largest Contentful Paint: <2.5s

## Security Standards

### Implemented
- JWT authentication
- HTTPS enforcement (production)
- Input validation
- SQL injection prevention
- CORS configuration
- Rate limiting
- Password hashing (bcrypt)

### In Progress (Phase 5)
- Security headers
- CSP configuration
- Dependency scanning
- Penetration testing
- Audit logging

## Monitoring & Logging

### Development
- Console logging
- Network inspector
- Browser DevTools
- Application logs

## Contributing

### Pull Request Process
1. Create feature branch with Task ID
2. Implement following specifications
3. Write/update tests
4. Update documentation
5. Request code review
6. Address review comments
7. Merge to develop

### Code Review Checklist
- ✓ Matches specification
- ✓ Tests passing
- ✓ Code style consistent
- ✓ No security issues
- ✓ Documentation updated
- ✓ Task ID referenced

## Support & Resources

### Documentation
- **Architecture**: `specs/architecture.md`
- **API Specification**: `specs/phase2/specify.md`
- **Frontend Setup**: `frontend/CLAUDE.md`
- **Backend Setup**: `backend/CLAUDE.md`
- **SDD Guide**: `AGENTS.md`

### Learning Resources
- Architecture diagrams in `specs/`
- Code comments explain complex logic
- Test files serve as usage examples
- Phase specifications provide context

### Getting Help
1. Check relevant specification documents
2. Review `CLAUDE.md` for AI assistance
3. Consult team documentation
4. Ask in team channels
5. Create detailed issue with context


## License
[Specify your license here]

## Contact
For questions or issues, contact the project team or create an issue in the repository.

---

Last Updated: December 30, 2025
Version: 1.0.0-spec
