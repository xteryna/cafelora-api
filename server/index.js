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

server.use(`${baseUrl}/assets`, express.static('assets'));

server.get(`${baseUrl}/api/drinks`, (req, res) => {
  res.json({
    status: 'success',
    results: drinks.map((drink) => ({
      ...drink,
      image: `${req.protocol}://${req.get('host')}${baseUrl}/assets/cups/${drink.id}.png`,
    })),
  })
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
