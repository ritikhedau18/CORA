<div align="center">

# CORA
### Codebase Oriented Retrieval Assistant

Connect GitHub, index any repository, and chat with your codebase using retrieval-augmented answers and citations.

![CORA landing page](./screenshots/landing.png)

</div>

---

## What is CORA?

CORA turns a GitHub repository into a chat-able knowledge base. Sign in with GitHub, pick a repo, and CORA indexes its source files into a vector store. From there you can ask natural-language questions about the codebase — how auth works, where a feature is implemented, what a service does — and get answers grounded in the actual code, with clickable citations pointing back to the exact files.

## Features

- **GitHub OAuth login** — sign in with GitHub, pull your owned, collaborator, and org repositories automatically.
- **RAG-based indexing** — repo files are filtered, chunked, embedded, and stored in Postgres + pgvector, scoped per repository.
- **Grounded chat with citations** — questions are answered by retrieving the most relevant code chunks first, so responses cite real file paths instead of hallucinating.
- **Streaming responses** — answers stream token-by-token over Server-Sent Events for a responsive chat experience.
- **Multi-repo workspace** — an overview dashboard tracks indexing status (ready / indexing / pending / failed) across all connected repositories.
- **Encrypted token storage** — GitHub access tokens are encrypted at rest before being persisted.

## Screenshots

<table>
<tr>
<td width="50%">

**Sign in**
![Sign in](./screenshots/sign-in.png)

</td>
<td width="50%">

**Workspace overview**
![Overview](./screenshots/overview.png)

</td>
</tr>
<tr>
<td width="50%">

**Repository list**
![Repositories](./screenshots/repositories.png)

</td>
<td width="50%">

**Chat with citations**
![Chat](./screenshots/chat.png)

</td>
</tr>
</table>

## Tech Stack

**Backend**
- Java 21, Spring Boot
- Spring Security (OAuth2 client — GitHub login)
- Spring AI (chat + embeddings via OpenAI, `pgvector` vector store)
- PostgreSQL + pgvector (`HNSW` index, cosine distance)
- Server-Sent Events for streaming chat replies

**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for data fetching/caching
- Streamdown for streaming markdown rendering

**Infra**
- Docker Compose (`pgvector/pgvector` Postgres image) for local development

## Architecture

```
GitHub OAuth login
        │
        ▼
 Repo list synced from GitHub API
        │
        ▼
   Select a repo → Start indexing
        │
        ▼
 ┌─────────────────────────────────┐
 │ Indexing pipeline                │
 │  1. Walk repo tree (GitHub API)  │
 │  2. Filter eligible files        │
 │  3. Chunk file contents          │
 │  4. Embed + store in pgvector    │
 └─────────────────────────────────┘
        │
        ▼
        Chat
        │
        ▼
 ┌─────────────────────────────────┐
 │ RAG pipeline                     │
 │  1. Save user message            │
 │  2. Similarity search (top-K)    │
 │  3. Build system + user prompt   │
 │  4. Stream LLM reply over SSE    │
 │  5. Save assistant reply + cites │
 └─────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- Docker (for Postgres + pgvector)
- A GitHub OAuth App (Client ID / Secret)
- An OpenAI API key

### 1. Start the database

```bash
docker compose up -d
```

This starts a `pgvector/pgvector:pg16` Postgres instance on `localhost:5433` with the `vector`, `hstore`, and `uuid-ossp` extensions initialized automatically.

### 2. Configure the backend

```bash
cd backend
cp src/main/resources/application-example.properties src/main/resources/application.properties
```

Fill in the required environment variables (see [Environment Variables](#environment-variables) below), then run:

```bash
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 3. Configure the frontend

```bash
cd client
npm install
```

Create a `.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Then run:

```bash
npm run dev
```

The frontend starts on `http://localhost:3000`.

### 4. Sign in

Open the frontend, click **Continue with GitHub**, authorize the app, and start indexing a repository.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | JDBC URL for Postgres |
| `DATABASE_USERNAME` | Postgres username |
| `DATABASE_PASSWORD` | Postgres password |
| `OPENAI_API_KEY` | OpenAI API key for chat + embedding models |
| `TOKEN_ENCRYPTOR_PASSWORD` | Password used to encrypt stored GitHub access tokens |
| `TOKEN_ENCRYPTOR_SALT` | Salt used alongside the encryptor password |
| `app.frontend-url` | Frontend base URL (for OAuth redirect) |
| `app.cors.allowed-origins` | Comma-separated list of allowed CORS origins |

You'll also need a GitHub OAuth App configured with a callback URL pointing at your backend (`/login/oauth2/code/github`), and its client ID/secret wired into `application.properties` under Spring Security's OAuth2 client config.

## Project Structure

```
CORA/
├── backend/                # Spring Boot API
│   └── src/main/java/com/cora/backend/
│       ├── config/         # Security, CORS, crypto, app config
│       ├── controller/     # REST controllers (auth, repos, chat)
│       ├── dto/            # Request/response records
│       ├── entity/         # JPA entities
│       ├── repository/     # Spring Data repositories
│       ├── security/       # OAuth2 user service, principal
│       └── services/
│           ├── ai/         # RAG: retrieval, prompt building, streaming
│           ├── github/     # GitHub API client, rate limiting
│           └── indexing/   # File filtering, chunking, indexing pipeline
├── client/                 # Next.js frontend
│   ├── app/                 # Routes (dashboard, chat, login, auth callback)
│   ├── components/          # UI + feature components
│   ├── hooks/                # Data hooks (auth, repos, chat)
│   └── lib/                  # API client, SSE streaming helper
└── docker-compose.yml       # Local Postgres + pgvector
```

## Roadmap / Ideas

- [ ] Handle truncated GitHub tree responses for very large repositories
- [ ] Parallelize file content fetching during indexing
- [ ] Add automated tests around chunking and citation mapping
- [ ] Support additional LLM providers beyond OpenAI

---

<div align="center">
Built by <a href="https://github.com/ritikhedau18">Ritik Hedau</a>
</div>
