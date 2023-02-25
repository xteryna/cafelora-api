import cors from 'cors';
import express from 'express';
import isEmail from 'validator/lib/isEmail.js';
import { body } from 'express-validator';
import { createDrinks, Drink, findUserDrink, getUserDrinks } from './drinks.js';
import { getUser, users } from './users.js';
import { nanorest, Success, success } from './nanorest.js';
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

server.use('/api/me', (req, res, next) => {
  const auth = req.header('Authorization');

  if (auth === undefined) {
    res.status(403).send({
      status: 'unauthorized',
      errors: ['Missing authorization header'],
    });
    return;
  }

  if (auth.startsWith('Email ')) {
    const email = auth.slice(6);
    if (!isEmail(email)) {
      res.status(403).send({
        status: 'error',
        errors: ['Not a valid email adress in authorization'],
      });
      return;
    }

    req.user = getUser(email);
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
    return findUserDrink(drinks, id, req.user!)
      .ifFail(() => ({
        httpStatus: 404,
        errors: [`Cannot find drink with id '${id}'`],
      }));
  })
);

server.patch(
  '/api/me/drinks/:id',
  body('ordered').not().isString().isBoolean(),
  rest.resource('drink', (req) => {
    const { id } = req.params;
    const { ordered } = req.body;
    const { orders } = req.user!;

    return findUserDrink(drinks, id, req.user!)
      .ifSuccess((drink): Drink => {
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
      })
      .ifFail(() => ({
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

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
