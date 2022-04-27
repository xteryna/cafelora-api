import cors from 'cors';
import express from 'express';
import drinks from './drinks.js';

const port = process.env.PORT ?? 4000;
const baseUrl = process.env.BASE_URL ?? '';

const server = express();
server.use(express.json());
server.use(cors());

server.use(`${baseUrl}/docs`, express.static('docs/_site', {
  extensions: ['html'],
}));

server.get(`${baseUrl}/api/drinks`, (req, res) => {
  res.json({
    status: 'success',
    results: drinks,
  })
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
