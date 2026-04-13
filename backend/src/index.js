require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { authContext } = require('./middleware/auth');

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/comp3133_assignment2';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:4200';

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

async function main() {
  await mongoose.connect(MONGO_URI);

  const app = express();
  const corsAllowed = (origin) => {
    if (!origin) return true;
    if (origin === CLIENT_ORIGIN) return true;
    if (origin === 'https://studio.apollographql.com') return true;
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
    if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
    return false;
  };
  app.use(
    cors({
      origin: (origin, callback) => callback(null, corsAllowed(origin)),
      credentials: true,
    })
  );

  app.use('/uploads', express.static(uploadsDir));

  app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file' });
      }
      const publicPath = `/uploads/${req.file.filename}`;
      const base =
        process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
      res.json({ url: `${base}${publicPath}`, path: publicPath });
    });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Allow Apollo Sandbox / GraphQL tools to load schema (disabled by default when NODE_ENV=production)
    introspection: true,
  });
  await server.start();

  app.use(
    '/graphql',
    json({ limit: '2mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        ...authContext(req),
        req,
      }),
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}/graphql`);
    console.log(`Uploads http://localhost:${PORT}/api/upload`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
