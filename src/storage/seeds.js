/**
 * Realistic Initial Developer Documentation Seeds
 * Production-grade technical content for DevNote
 */

export const INITIAL_FOLDERS = [
  {
    id: 'folder-getting-started',
    name: 'Getting Started',
    parentId: null,
    createdAt: '2025-10-05T09:00:00.000Z'
  },
  {
    id: 'folder-guides',
    name: 'Guides',
    parentId: null,
    createdAt: '2025-10-05T09:05:00.000Z'
  },
  {
    id: 'folder-api-ref',
    name: 'API Reference',
    parentId: null,
    createdAt: '2025-10-05T09:10:00.000Z'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-readme',
    title: 'README.md',
    folderId: null,
    createdAt: '2025-10-05T09:15:00.000Z',
    updatedAt: '2025-10-05T10:00:00.000Z',
    content: `# DevNote Workspace

Welcome to **DevNote**, a browser-native documentation workspace built for software engineers, technical leads, and systems architects.

DevNote allows you to write, organize, search, and preview Markdown documentation entirely within your browser with persistent IndexedDB storage, zero external telemetry, and instant split-view rendering.

---

### Key Capabilities

* **Local-First Architecture:** Documents and folders are stored in browser IndexedDB. No remote tracking or third-party dependencies required.
* **Dual-Pane Synchronized Preview:** Live GFM (GitHub Flavored Markdown) rendering with code syntax highlighting and interactive task lists.
* **Hierarchical File Tree:** Nest documents within folders, drag or move files across directories, and perform batch file operations.
* **Instant Command Palette (\`Cmd+K\`):** Navigate files, execute workspace commands, toggle themes, and trigger exports without touching the mouse.
* **Full-Text In-Memory Search (\`Cmd+P\`):** Query document titles and content with real-time excerpt matching and keyword highlighting.
* **Import & Export:** Native export to individual files and structured ZIP workspace archives.

---

### Quick Workspace Cheatsheet

| Shortcut | Action |
| :--- | :--- |
| \`Cmd / Ctrl + K\` | Open Command Palette |
| \`Cmd / Ctrl + P\` | Quick File & Content Search |
| \`Alt / ⌥ + N\` | Create New Document |
| \`Cmd / Ctrl + B\` | Toggle Bold Syntax |
| \`Cmd / Ctrl + I\` | Toggle Italic Syntax |
| \`Esc\` | Dismiss Active Modal / Overlay |

---

### Future Implementation

* Offline WebRTC peer-to-peer document sharing

> **Engineering Note:** To inspect or modify workspace settings, use the top bar or launch the Command Palette with \`Cmd+K\`.
`
  },
  {
    id: 'doc-getting-started',
    title: 'getting-started.md',
    folderId: 'folder-getting-started',
    createdAt: '2025-10-05T10:30:00.000Z',
    updatedAt: '2025-10-05T11:00:00.000Z',
    content: `# Getting Started with DevNote

This guide walks you through setting up your developer environment, configuring your documentation structure, and adopting the recommended workflow.

---

## 1. System Requirements

Before running the local development server or building the bundle, ensure your system satisfies the following prerequisites:

* **Node.js:** v18.0.0 or later (LTS recommended)
* **Package Manager:** npm v9+ or pnpm v8+
* **Supported Browsers:** Chrome 100+, Firefox 105+, Safari 16+, Edge 100+

---

## 2. Environment Configuration

Create a local environment file in the project root:

\`\`\`bash
# Copy template environment config
cp .env.example .env.local
\`\`\`

Populate the required configuration variables:

\`\`\`ini
# Application configuration
APP_NAME=DevNote
APP_ENV=development
APP_PORT=5173

# Storage settings
STORAGE_ENGINE=indexeddb
STORAGE_DB_NAME=devnote_db
STORAGE_VERSION=1
\`\`\`

---

## 3. Recommended Workspace Layout

Organize your internal documentation using a predictable hierarchy:

\`\`\`
workspace/
├── docs/             # High-level architecture and onboarding
├── guides/           # Step-by-step procedures and runbooks
├── api/              # Contract specs and endpoint references
└── README.md         # Repository landing page
\`\`\`

> **Best Practice:** Keep filenames in lowercase hyphenated format (e.g. \`quick-start.md\`, \`token-rotation.md\`) to avoid cross-platform filesystem discrepancies.
`
  },
  {
    id: 'doc-installation',
    title: 'installation.md',
    folderId: 'folder-getting-started',
    createdAt: '2025-10-05T11:15:00.000Z',
    updatedAt: '2025-10-05T12:00:00.000Z',
    content: `# Installation & Build Setup

This runbook covers local setup, package installation, running tests, and preparing the production build artifacts.

---

## 1. Clone & Install Dependencies

Clone the repository and install dependencies using standard package managers:

\`\`\`bash
# Clone the repository
git clone https://github.com/mah3shbishnoi/devnote.git
cd devnote

# Install runtime and dev dependencies
npm install
\`\`\`

---

## 2. Development Server

Start Vite in local development mode with instant Hot Module Replacement (HMR):

\`\`\`bash
npm run dev
\`\`\`

The application will be served at:

\`\`\`
  VITE v6.2.0  ready in 184 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
\`\`\`

---

## 3. Production Bundling

To generate the optimized production assets:

\`\`\`bash
npm run build
\`\`\`

The compiled assets are output into the \`dist/\` directory with hash-based cache busting:

\`\`\`
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
\`\`\`

---

## 4. Verification Checklist

- [x] Clean dependency resolution with no peer warnings
- [x] IndexedDB database initialization verified in DevTools
- [x] Prism.js syntax definitions loaded properly
- [x] Responsive layout verified at desktop, tablet, and mobile breakpoints
`
  },
  {
    id: 'doc-authentication',
    title: 'authentication.md',
    folderId: 'folder-guides',
    createdAt: '2025-10-06T14:00:00.000Z',
    updatedAt: '2025-10-06T15:30:00.000Z',
    content: `# Authentication Architecture & JWT Validation

This document outlines the authentication lifecycle, stateless token validation, refresh strategies, and role-based access control (RBAC).

---

## Architecture Overview

All incoming API requests pass through the reverse proxy authentication filter before reaching downstream services.

\`\`\`
[ Client ] 
    │  Bearer JWT
    ▼
[ API Gateway / Envoy ] 
    ├── 1. Validate RS256 signature
    ├── 2. Verify claims (exp, iss, aud)
    └── 3. Inject X-User-Id & X-User-Role
    ▼
[ Microservices Cluster ]
\`\`\`

---

## Token Verification Implementation

Below is the standard Node.js authentication middleware utilizing \`jsonwebtoken\` and JWKS public key caching:

\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://auth.internal.corp/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err, undefined);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: 'https://auth.internal.corp',
    audience: 'https://api.internal.corp'
  }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token', code: err.name });
    }
    req.user = decoded;
    next();
  });
}
\`\`\`

---

## Token Lifetimes & Security Headers

| Token Type | Lifetime | Storage Location | Rotation Policy |
| :--- | :--- | :--- | :--- |
| Access Token | 15 minutes | In-memory only | Silent refresh via HttpOnly cookie |
| Refresh Token | 7 days | Secure, HttpOnly, SameSite=Strict cookie | One-time use with token family invalidation |

> **Security Advisory:** Never persist JWT access tokens in \`localStorage\` or unencrypted browser databases to prevent Cross-Site Scripting (XSS) extraction.
`
  },
  {
    id: 'doc-deployment',
    title: 'deployment.md',
    folderId: 'folder-guides',
    createdAt: '2025-10-06T16:00:00.000Z',
    updatedAt: '2025-10-06T17:15:00.000Z',
    content: `# Production Deployment Guide

This guide describes our automated CI/CD pipeline, containerization guidelines, and Kubernetes zero-downtime rolling updates.

---

## 1. Containerfile Definition

We enforce multi-stage builds to produce minimal, hardened scratch containers:

\`\`\`dockerfile
# Stage 1: Build & Bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Stage 2: Production HTTP Server
FROM nginx:1.25-alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

---

## 2. Kubernetes Deployment Manifest

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devnote-workspace
  namespace: production
  labels:
    app.kubernetes.io/name: devnote
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: devnote
  template:
    metadata:
      labels:
        app: devnote
    spec:
      containers:
        - name: web
          image: ghcr.io/mah3shbishnoi/devnote:v1.0.0
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
\`\`\`

---

## 3. Zero-Downtime Rollout Verification

Execute rolling upgrade and monitor deployment status:

\`\`\`bash
# Trigger rolling update
kubectl set image deployment/devnote-workspace web=ghcr.io/mah3shbishnoi/devnote:v1.0.1 -n production

# Stream rollout status
kubectl rollout status deployment/devnote-workspace -n production
\`\`\`
`
  },
  {
    id: 'doc-api-reference',
    title: 'api-reference.md',
    folderId: 'folder-api-ref',
    createdAt: '2025-10-07T10:00:00.000Z',
    updatedAt: '2025-10-07T11:45:00.000Z',
    content: `# REST API Reference

The DevNote core documentation service exposes a RESTful interface for syncing documents, querying metadata, and executing structured searches.

---

## Base URL

\`\`\`
https://api.devnote.internal/v1
\`\`\`

All requests must include standard headers:
* \`Authorization: Bearer <token>\`
* \`Content-Type: application/json\`
* \`Accept: application/json\`

---

## Endpoints

### 1. List Documents

\`\`\`http
GET /documents
\`\`\`

Query Parameters:
* \`folder_id\` *(optional, string)*: Filter documents by parent folder UUID.
* \`sort\` *(optional, string)*: Sort by \`updated_at\` or \`title\`. Default: \`updated_at\`.
* \`limit\` *(optional, integer)*: Maximum records to return. Default: \`50\`.

#### Example Response:

\`\`\`json
{
  "status": "success",
  "data": [
    {
      "id": "doc-readme",
      "title": "README.md",
      "folder_id": null,
      "size_bytes": 1948,
      "updated_at": "2025-10-05T10:00:00.000Z"
    },
    {
      "id": "doc-getting-started",
      "title": "getting-started.md",
      "folder_id": "folder-getting-started",
      "size_bytes": 834,
      "updated_at": "2025-10-05T11:00:00.000Z"
    }
  ],
  "pagination": {
    "has_more": false,
    "total_count": 2
  }
}
\`\`\`

---

### 2. Create Document

\`\`\`http
POST /documents
\`\`\`

Request Payload:

\`\`\`json
{
  "title": "architecture-adr-004.md",
  "folder_id": "folder-guides",
  "content": "# ADR-004: Adopting Local-First State\n\nStatus: Accepted"
}
\`\`\`

---

### 3. Error Codes Reference

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| \`400 Bad Request\` | \`INVALID_PAYLOAD\` | Required fields are missing or fail schema validation. |
| \`401 Unauthorized\` | \`AUTH_REQUIRED\` | Missing or expired authorization bearer token. |
| \`404 Not Found\` | \`DOCUMENT_NOT_FOUND\` | The requested document UUID does not exist. |
| \`409 Conflict\` | \`NAME_COLLISION\` | A document with this title already exists in the folder. |
`
  }
];
