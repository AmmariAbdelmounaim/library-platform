# Library Platform

A full-stack library management platform built with NestJS (API) and React (Client).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (for database and Docker deployment)
- **Git**

## 🚀 Quick Start

### Option 1: Local Development (Recommended for Development)

#### 1. Clone the repository

```bash
git clone https://github.com/AmmariAbdelmounaim/library-platform.git
cd library-platform
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (defaults are provided):

#### 4. Start the database

```bash
npm run db:start
```

This will start PostgreSQL and Redis in Docker containers.

#### 5. Run database migrations

```bash
npm run db:migrate
```

#### 6. (Optional) Seed the database

```bash
npm run db:seed
```

#### 7. Start the development servers

```bash
# Start both API and Client
npm run dev

# Or start them separately:
npm run dev:api    # API only (runs on http://localhost:3000)
npm run dev:client # Client only (runs on http://localhost:4200)
```

#### 8. Access the application

- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000/api
- **API Documentation (Swagger)**: http://localhost:3000/api/docs

---

### Option 2: Docker Deployment (Recommended for Production)

#### 1. Clone and navigate to the project

```bash
git clone https://github.com/AmmariAbdelmounaim/library-platform.git
cd library-platform
```

#### 2. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your production configuration. The docker-compose file will use these values.

#### 3. Build and start all services

```bash
docker-compose up -d
```

This will:

- Build the API and Client applications (multi-stage Docker build)
- Start PostgreSQL database
- Start Redis
- Start the API service (which serves both API and frontend from a single container)

**Note**: In production, the API serves the built React frontend as static files. The API handles client-side routing by serving `index.html` for non-API routes.

#### 4. Check service status

```bash
docker-compose ps
```

#### 5. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

#### 6. Access the application

- **Application**: http://localhost:3000
- **API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs

---

## 🗄️ Database Management

### Start/Stop Database

```bash
npm run db:start  # Start PostgreSQL and Redis
npm run db:stop   # Stop PostgreSQL and Redis
```

### Run Migrations

```bash
npm run db:migrate  # Run all migrations
```

### Seed Database

```bash
npm run db:seed  # Seed with initial data
```

### Reset Database

```bash
npm run db:reset  # WARNING: This will delete all data and recreate the database
```

### View Database Logs

```bash
npm run db:logs
```

### Database Studio (Drizzle)

```bash
npm run db:studio  # Opens Drizzle Studio for database management
```

---

## 📝 Available Scripts

### Development

- `npm run dev` - Start both API and Client in development mode
- `npm run dev:api` - Start only the API server
- `npm run dev:client` - Start only the Client server

### Building

- `npm run build` - Build all applications
- `npm run build:api` - Build only the API
- `npm run build:client` - Build only the Client

### Testing

- `npm test` - Run all tests
- `npm run test:api` - Run API tests
- `npm run test:client` - Run Client tests

### Code Quality

- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database

- `npm run db:start` - Start database containers
- `npm run db:stop` - Stop database containers
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run db:logs` - View database logs
- `npm run db:studio` - Open Drizzle Studio

### API Generation

- `npm run generate:api` - Generate API client types from OpenAPI spec using Orval

---

## 🐳 Docker Commands

All docker-compose commands should be run from the root directory.

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Rebuild Services

```bash
docker-compose up -d --build
```

### View Logs

```bash
docker-compose logs -f [service-name]
```

### Stop and Remove Volumes (⚠️ deletes data)

```bash
docker-compose down -v
```

---

## 🏗️ Project Structure

```
library-platform/
├── apps/
│   ├── api/          # NestJS API backend
│   │   ├── src/      # API source code
│   │   └── Dockerfile # Multi-stage Dockerfile (builds API + Client)
│   └── client/       # React frontend (TanStack Router)
│       ├── src/      # Client source code
│       └── orval.config.ts # API client generation config
├── infra/
│   ├── database/     # Database migrations and seeds
│   ├── docker/       # Docker initialization scripts
│   └── scripts/      # Database management scripts
├── docker-compose.yml # Docker Compose configuration (root level)
└── package.json      # Root package.json with workspace scripts
```

### Key Features

- **Monorepo**: Uses Nx for managing the monorepo workspace
- **API**: NestJS backend with Drizzle ORM, JWT authentication, and Swagger documentation
- **Client**: React frontend with TanStack Router and React Query
- **Database**: PostgreSQL with Row Level Security (RLS) and migrations
- **Caching**: Redis for session management and caching
- **Production**: Single Docker container serves both API and frontend

---

## 🐛 Troubleshooting

### Database connection issues

- Ensure Docker is running
- Check if containers are running: `docker ps`
- Verify environment variables in `.env`
- Check database logs: `npm run db:logs`

### Port already in use

- Change ports in `.env` file
- Or stop the service using the port

### Build errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Nx cache: `npx nx reset`

### Docker build fails

- Ensure Docker has enough resources allocated
- Try rebuilding without cache: `docker-compose build --no-cache`

---

## 🔧 Technology Stack

### Backend

- **NestJS**: Node.js framework for building scalable server-side applications
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **PostgreSQL**: Relational database with Row Level Security
- **Redis**: In-memory data store for caching and sessions
- **BullMQ**: Job queue for background tasks (e.g., Google Books API integration)
- **JWT**: Authentication using Passport.js
- **Swagger/OpenAPI**: API documentation

### Frontend

- **React 19**: UI library
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework
- **Orval**: Generate TypeScript API client from OpenAPI spec
- **Vite**: Build tool and dev server

### DevOps

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nx**: Monorepo tooling and build system

## 📚 Additional Resources

- **API Documentation**: Available at `/api/docs` when the server is running
- **Nx Documentation**: https://nx.dev
- **NestJS Documentation**: https://docs.nestjs.com
- **React Documentation**: https://react.dev
- **TanStack Router**: https://tanstack.com/router
- **Drizzle ORM**: https://orm.drizzle.team

---

## 📄 License

MIT
