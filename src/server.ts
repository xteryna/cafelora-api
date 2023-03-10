import cors from 'cors';
import express from 'express';
import { body } from 'express-validator';
import { createDrinks, Drink, findUserDrink, getUserDrinks } from './drinks.js';
import { getUser, users } from './users.js';
import { success } from './typephoon.js';
import { ApiError, nanorest } from './nanorest.js';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const port = process.env.PORT ?? 4000;

const drinks = createDrinks(`${process.env.SERVER_URL ?? ''}`);

const server = express();
server.use(express.json());
server.use(cors());

server.use('/apidoc', express.static('docs/_site', {
  extensions: ['html'],
}));

server.use('/assets', express.static('assets'));

const rest = nanorest({
  serverUrl: process.env.SERVER_URL ?? '',
});

server.use('/api/me', async (req, res, next) => {
  const auth = req.header('Authorization');

  if (auth === undefined) {
    res.status(403).send({
      status: 'unauthorized',
      errors: ['Missing authorization header'],
    });
    return;
  }

  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    
    const response = await axios.get('https://kodim.cz/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });
    
    if(response.status === 401) {
      res.status(401).send({
        status: 'unauthorized',
        errors: ['Authorization token was rejected by kodim.cz']
      });
      return;
    } 
    
    if (response.status !== 200) {
      res.status(500).send({
        status: 'server error',
        errors: [
          'Unknown server error when autheticating agains kodim.cz'
        ]
      });
      return;
    }

    req.user = getUser(response.data.email);
    next();
    return;
  }

  res.status(403).send({
    status: 'unauthorized',
    errors: ['Invalid authorization header format'],
  });
});

server.get(
  '/api/me/drinks',
  rest.resource('drinks', (req) => {
    return success(getUserDrinks(drinks, req.user!));
  })
);

server.get(
  '/api/me/drinks/:id',
  rest.resource('drink', (req) => {
    const { id } = req.params;
    return findUserDrink(drinks, id, req.user!).mapErr(() => ({
      httpStatus: 404,
      errors: [`Cannot find drink with id '${id}'`],
    }) as ApiError);
  })
);

server.patch(
  '/api/me/drinks/:id',
  body('ordered').not().isString().isBoolean(),
  rest.resource('drink', (req) => {
    const { id } = req.params;
    const { ordered } = req.body;
    const { orders } = req.user!;

    return findUserDrink(drinks, id, req.user!).map((drink): Drink => {
      if (ordered === drink.ordered) {
        return drink;
      }

      if (ordered === true) {
        orders.push(id);
      } else {
        const index = orders.indexOf(id);
        orders.splice(index, 1);
      }
      return { ...drink, ordered };
    }).mapErr(() => ({
      httpStatus: 404,
      errors: [`Cannot find drink with id '${id}'`],
    }));
  })
);

server.get(
  '/api/admin/users',
  rest.resource('users', () => {
    return success(users);
  })
);

server.use('/', express.static('frontend/dist'));

server.get('*', (req, resp) => {
  resp.sendFile('index.html', { root: 'frontend/dist' });
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
