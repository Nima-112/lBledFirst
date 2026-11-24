# L'Bled First 🇲🇦

**L'Bled First** is a team-built web platform for discovering Moroccan experiences, activities and training content. The `ai-integration` branch includes backend services for video transcription and translation.

## Main features

- Browse and manage experiences, activities, bookings and reviews.
- Manage video training content, chapters, enrolments and purchases.
- Authenticate users with Spring Security, JWT-based sessions and optional Google OAuth2.
- Admin dashboard for managing platform content and users.
- AI-assisted audio transcription and translation, with FFmpeg/ffprobe and an OpenAI-compatible API. The translation configuration lists eight target languages.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Backend | Java 17, Spring Boot 3.3, Spring Data JPA, Spring Security |
| Frontend | React, TypeScript, TanStack Router/Start, Vite, Tailwind CSS |
| Database | MySQL 8 |
| AI/media | OpenAI-compatible transcription and translation API, FFmpeg |
| Tooling | Maven, Docker Compose, Git, ESLint, PowerShell API smoke tests |

## Repository structure

```text
backend/
  pom.xml
  src/main/java/ma/lbledfirst/backend/
    config/       Spring configuration
    controller/   REST API endpoints
    domain/       Entities and enums
    dto/          Request and response data
    repository/   Persistence layer
    security/     JWT and cookie utilities
    service/      Business logic and AI processing
  src/test/java/  JUnit 5 tests
frontend/
  src/components/ UI components
  src/routes/     Page routes
  src/services/   Client services
docker-compose.yml
run-tests.ps1     Local API smoke test script
```

## Getting started

Requirements: Docker and Docker Compose. For running tests without Docker, install **Java 17** and **Maven**. The AI audio-processing feature requires its configured external API and FFmpeg.

```bash
git clone https://github.com/Nima-112/lBledFirst.git
cd lBledFirst
git switch ai-integration
```

Create a local `.env` in the repository root. At minimum, the Compose configuration expects database credentials and a JWT secret, plus relevant frontend and backend URLs. Other features need OAuth2, SMTP and AI credentials. Example *placeholder* configuration:

```dotenv
MYSQL_ROOT_PASSWORD=replace-with-a-local-password
MYSQL_DATABASE=lbled_first
MYSQL_USER=lbled_first
MYSQL_PASSWORD=replace-with-a-local-password
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECURE=false
CORS_ALLOWED_ORIGINS=http://localhost:3000
VITE_API_URL=http://localhost:8080
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:8080
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
ADMIN_EMAIL=
ADMIN_PASSWORD=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL_TRANSCRIPTION=whisper-large-v3
OPENAI_MODEL_TRANSLATION=openai/gpt-oss-120b
```

**Never commit real credentials.** The repository `.gitignore` excludes `.env` files. Some integrations may not initialize without valid provider credentials.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API health endpoint: http://localhost:8080/api/health
- MySQL host port: `3307`
- Optional Adminer: `docker compose --profile dev up --build` (http://localhost:8090)

> The complete Docker setup has not been run or validated as part of this documentation change. Verify all required configuration and services locally.

## Tests and code quality

### Backend unit tests

JUnit 5 tests in `backend/src/test/java/` verify selected API and authentication-cookie behavior. They do not need a running database or live AI credentials.

```bash
cd backend
mvn test
```

### Existing API smoke tests

The project contains `run-tests.ps1`, which makes HTTP requests against a running local backend to exercise login, experience booking/deletion and selected administration endpoints.

```powershell
# Only run against a disposable local development database.
./run-tests.ps1
```

**Warning:** The smoke-test script uses a seeded development login and creates or changes data. Never run it against production. It is distinct from isolated unit tests.

### Frontend checks

```bash
cd frontend
npm ci
npm run lint
npm run build
```

`lint` and `build` are checks; the inspected branch did not contain a separate frontend unit-test suite.

## Development approach and contributions

This project was developed collaboratively by a team of four developers, using Git for version control and task-based collaboration. AI-assisted code was reviewed, understood and tested before integration.

### Team contributions

| Team member | Main responsibilities |
|---|---|
| **[Anass Hadioui](https://github.com/AnassHadioui)** | Backend development, REST API testing and security, AI transcription and translation pipeline integration. |
| **Naima Chou** | Frontend development and integration with backend entities and APIs. |
| **Douae Zouake** | Frontend development and integration with backend entities and APIs. |
| **Hajar Slimani** | Backend development and implementation of server-side features. |

Contributions can also be explored through the [repository commit history](https://github.com/Nima-112/lBledFirst/commits/ai-integration).

This README documents the `ai-integration` branch. External services and end-to-end functionality require additional configuration and validation.
