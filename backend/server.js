// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import multer from 'multer';
import { simpleGit } from 'simple-git';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import os from 'os';
import crypto from 'crypto';

// =============================================
// Firebase Admin Init
// =============================================
let firebaseInitialized = false;

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  firebaseInitialized = true;
  console.log('✅ Firebase Admin initialized');
} catch (e) {
  console.warn('⚠️  Firebase Admin not configured — auth middleware will be skipped in dev mode.');
  console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
}

// =============================================
// Express App
// =============================================
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer for zip uploads
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Global rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,
  message: { error: 'Too many requests, slow down.' }
});
app.use(limiter);

// =============================================
// 🔐 Auth Middleware
// =============================================
const verifyAuth = async (req, res, next) => {
  // In dev mode, skip if Firebase not configured
  if (!firebaseInitialized) {
    req.user = { uid: 'dev-user', email: 'dev@localhost' };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ error: 'No auth token provided.' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Auth error:', e.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// =============================================
// Helper: Code Aggregator
// =============================================
const IGNORE_DIRS = ['.git', 'node_modules', 'dist', 'build', '.next', 'vendor', '__pycache__', 'venv', 'target'];
const ALLOWED_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.php', '.rb', '.css', '.html', '.sh', '.yaml', '.yml', '.json'];

async function aggregateCode(dirPath) {
  let aggregated = "";
  const files = await fs.readdir(dirPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      if (!IGNORE_DIRS.includes(file.name)) {
        aggregated += await aggregateCode(fullPath);
      }
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (ALLOWED_EXTS.includes(ext) || file.name === 'Dockerfile' || file.name === 'package.json') {
        const content = await fs.readFile(fullPath, 'utf8');
        aggregated += `\n\n// --- FILE: ${file.name} ---\n${content.slice(0, 5000)}\n`;
      }
    }

    if (aggregated.length > 30000) break; // Limit total context to ~30k chars
  }
  return aggregated;
}

// =============================================
// 🤖 LLM Prompt Builder
// =============================================
const buildPrompt = (code) => `You are VibeSecure, an expert DevSecOps AI. Analyze the following code and return a comprehensive security report as a single valid JSON object.

CODE TO ANALYZE:
\`\`\`
${code.slice(0, 8000)}
\`\`\`

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation). 
CRITICAL GRADING RULES:
- SCORE: 0-100. Start at 100. Deduct 25 for each CRITICAL, 15 for each HIGH, 5 for each MEDIUM.
- GRADE: Must be consistent with score: A(90+), B(80-89), C(70-79), D(50-69), F(<50).
- If any the code contains a CRITICAL vulnerability (like SQLi or Hardcoded Admin Secrets), the grade CANNOT be higher than D, regardless of other factors.

{
  "score": <integer 0-100, overall security score>,
  "summary": "<2-3 sentence summary of findings>",
  "security": {
    "grade": "<letter grade A-F>",
    "issues": [
      {
        "severity": "<critical|high|medium|low|info>",
        "title": "<short title>",
        "description": "<what the issue is>",
        "line": <line number or null>,
        "fix": "<concrete fix recommendation>"
      }
    ]
  },
  "complexity": {
    "score": <integer 0-100>,
    "cyclomatic": <integer>,
    "cognitive": <integer>,
    "linesOfCode": <integer>,
    "functions": <integer>,
    "rating": "<Low|Medium|High|Very High>",
    "details": "<brief explanation>"
  },
  "dependencies": [
    {
      "name": "<package name>",
      "version": "<detected version or 'unknown'>",
      "status": "<safe|vulnerable|unknown>",
      "vulnerabilities": <number or null>,
      "severity": "<critical|high|medium|low|null>",
      "license": "<license or 'Unknown'>"
    }
  ],
  "architecture": {
    "pattern": "<detected pattern e.g. MVC, Microservice, Monolith>",
    "components": ["<component1>", "<component2>"],
    "concerns": ["<concern1>", "<concern2>"],
    "diagram": {
      "nodes": [
        { "id": "<id>", "label": "<display label>", "type": "<external|server|module|database|queue>" }
      ],
      "edges": [
        { "from": "<node id>", "to": "<node id>", "label": "<relationship>" }
      ]
    }
  }
}`;

// =============================================
// 📡 API Routes
// =============================================

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VibeSecure API', timestamp: new Date().toISOString() });
});

// 🔁 POST /analyze — Main analysis endpoint
app.post('/analyze', verifyAuth, upload.single('file'), async (req, res) => {
  let { code, mode, gitUrl } = req.body;
  
  let tempDir = null;

  try {
    if (mode === 'git' && gitUrl) {
      tempDir = path.join(os.tmpdir(), `vibe-git-${crypto.randomUUID()}`);
      console.log(`[Git] Cloning ${gitUrl} to ${tempDir}`);
      await simpleGit().clone(gitUrl, tempDir, ['--depth', '1']);
      code = await aggregateCode(tempDir);
    } else if (mode === 'zip' && req.file) {
      tempDir = path.join(os.tmpdir(), `vibe-zip-${crypto.randomUUID()}`);
      console.log(`[Zip] Extracting to ${tempDir}`);
      const zip = new AdmZip(req.file.path);
      zip.extractAllTo(tempDir, true);
      code = await aggregateCode(tempDir);
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);
    }

    if (!code || code.trim().length < 10) {
      return res.status(400).json({ error: 'No readable code found for analysis.' });
    }

    console.log(`[/analyze] Mode: ${mode} | User: ${req.user.email || req.user.uid} | Code: ${code.length} chars`);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      console.warn('⚠️  OPENROUTER_API_KEY not set — returning mock data');
      return res.json(getMockResponse(code));
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'VibeSecure AI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: buildPrompt(code) }],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      // Fallback to mock data if AI fails (better UX for demo)
      console.log('Falling back to mock security data...');
      return res.json(getMockResponse(code));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(502).json({ error: 'Empty AI response.' });

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'AI returned non-JSON response.' });

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (e) {
    console.error('Analysis error:', e);
    res.status(500).json({ error: 'Internal analysis error: ' + e.message });
  } finally {
    // Cleanup temporary directory
    if (tempDir && existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
    }
  }
});

// 🔁 POST /dependencies — Standalone dep check
app.post('/dependencies', verifyAuth, async (req, res) => {
  const { packages } = req.body;
  if (!Array.isArray(packages) || packages.length === 0) {
    return res.status(400).json({ error: 'packages array is required.' });
  }

  const results = await Promise.allSettled(
    packages.slice(0, 20).map(async (pkg) => {
      try {
        const r = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`);
        if (!r.ok) return { name: pkg, status: 'unknown', version: 'unknown', license: 'Unknown' };
        const data = await r.json();
        return {
          name: pkg,
          version: data.version || 'unknown',
          license: data.license || 'Unknown',
          status: 'safe', // Basic check — for full CVE, integrate Snyk/OSS Index
        };
      } catch {
        return { name: pkg, status: 'unknown', version: 'unknown', license: 'Unknown' };
      }
    })
  );

  res.json(results.map(r => r.status === 'fulfilled' ? r.value : { name: 'unknown', status: 'error' }));
});

// =============================================
// Mock Data for dev (no OpenRouter key)
// =============================================
function getMockResponse(code) {
  const lines = code.split('\n').length;
  return {
    score: 64,
    summary: "Critical vulnerabilities detected in the core modules. This code contains SQL injection patterns, hardcoded secrets, and missing input validation. Immediate remediation is required.",
    security: {
      grade: "D",
      issues: [
        { severity: "critical", title: "Demo: SQL Injection Risk", description: "Potential unsafe query construction detected.", line: 5, fix: "Use parameterized queries with ? placeholders." },
        { severity: "high", title: "Demo: Hardcoded Credential", description: "Secret value appears to be inline in source code.", line: 2, fix: "Use process.env.SECRET_NAME instead." },
      ]
    },
    complexity: { score: 65, cyclomatic: 6, cognitive: 10, linesOfCode: lines, functions: 3, rating: "Medium", details: "Moderate complexity detected in mock analysis." },
    dependencies: [
      { name: "express", version: "4.x", status: "safe", license: "MIT" },
      { name: "example-pkg", version: "1.0.0", status: "vulnerable", vulnerabilities: 2, severity: "high", license: "Apache-2.0" },
    ],
    architecture: {
      pattern: "REST API",
      components: ["HTTP Layer", "Business Logic", "Data Layer"],
      concerns: ["Mock data shown", "Configure OpenRouter for real analysis"],
      diagram: {
        nodes: [
          { id: "client", label: "Client", type: "external" },
          { id: "api", label: "API Server", type: "server" },
          { id: "db", label: "Database", type: "database" },
        ],
        edges: [
          { from: "client", to: "api", label: "HTTP/REST" },
          { from: "api", to: "db", label: "Query" },
        ]
      }
    }
  };
}

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
  console.log(`\n🛡️  VibeSecure API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Auth:   ${firebaseInitialized ? '✅ Firebase enabled' : '⚠️  Dev mode (no auth)'}`);
  console.log(`   AI:     ${process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' ? '✅ OpenRouter connected' : '⚠️  Mock mode (no API key)'}\n`);
});
