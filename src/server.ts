import cors from 'cors';
import express from 'express';
import { body } from 'express-validator';
import { createDrinks, Drink, findUserDrink, getUserDrinks } from './drinks.js';
import { getUser, users } from './users.js';
import { success } from 'monadix/result';
import { ApiError, nanorest } from './nanorest.js';
import { kodimAuth } from '@kodim/auth';
import * as dotenv from 'dotenv';

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

server.use('/api/me', kodimAuth());

server.get(
  '/api/me/drinks',
  rest.resource('drinks', (req) => {
    const user = getUser(req.user!.email);
    return success(getUserDrinks(drinks, user));
  })
);

server.get(
  '/api/me/drinks/:id',
  rest.resource('drink', (req) => {
    const user = getUser(req.user!.email);
    const { id } = req.params;
    return findUserDrink(drinks, id, user).mapErr(() => ({
      httpStatus: 404,
      errors: [`Cannot find drink with id '${id}'`],
    }) as ApiError);
  })
);

server.patch(
  '/api/me/drinks/:id',
  body('ordered').not().isString().isBoolean(),
  rest.resource('drink', (req) => {
    const user = getUser(req.user!.email);
    const { id } = req.params;
    const { ordered } = req.body;
    const { orders } = user;

    return findUserDrink(drinks, id, user).map((drink): Drink => {
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
