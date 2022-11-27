import cors from 'cors';
import express from 'express';
import isEmail from 'validator/lib/isEmail.js';
import { body } from 'express-validator';
import { Drink, drinks, findDrink } from './drinks.js';
import { getUser, users } from './users.js';
import { nanorest, Success, success } from './nanorest.js';

const port = process.env.PORT ?? 4000;
const baseUrl = process.env.BASE_URL ?? '';

const server = express();
server.use(express.json());
server.use(cors());

server.use(`${baseUrl}/docs`, express.static('docs/_site', {
  extensions: ['html'],
}));

server.use(`${baseUrl}/assets`, express.static('assets'));

const rest = nanorest({
  serverUrl: process.env.SERVER_URL ?? '',
});

server.use(`${baseUrl}/api/me`, (req, res, next) => {
  console.log('auth1');
  const auth = req.header('Authorization');

  if (auth === undefined) {
    res.status(403).send({
      status: 'unauthorized',
      errors: ['Missing authorization header'],
    });
    return;
  }

  console.log('auth2');

  if (auth.startsWith('Email ')) {
    const email = auth.slice(6);
    if (!isEmail(email)) {
      res.status(403).send({
        status: 'error',
        errors: ['Not a valid email adress in authorization'],
      });
      return;
    }

    console.log('auth3');
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
  `${baseUrl}/api/me/drinks`,
  rest.resource('drinks', (req) => {
    return success(
      drinks(process.env.SERVER_URL ?? '', req.user?.orders),
    );
  })
);

server.get(
  `${baseUrl}/api/me/drinks/:id`,
  rest.resource('drink', (req) => {
    const { id } = req.params;
    return findDrink(
      id, process.env.SERVER_URL ?? '', req.user!.orders
    ).ifFail(() => ({
      httpStatus: 404,
      errors: [`Cannot find drink with id '${id}'`],
    }));
  })
);

server.patch(
  `${baseUrl}/api/me/drinks/:id`,
  body('ordered').isBoolean(),
  rest.resource('drink', (req) => {
    console.log('patch');
    const { id } = req.params;
    const { ordered } = req.body;
    const orders = req.user!.orders;

    return findDrink(id, process.env.SERVER_URL ?? '', req.user!.orders)
      .ifSuccess((drink): Drink => {
        console.log(drink);
        if (ordered === true) {
          orders.push(id);
        } else {
          const index = orders.indexOf(id);
          req.user!.orders.splice(index, 1);
        }
        return { ...drink, ordered };
      })
      .ifFail(() => ({
        httpStatus: 404,
        errors: [`Cannot find drink with id '${id}'`],
      }));
  })
);

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
