import express from 'express';
import { z } from 'zod';
import jsonder from 'jsonder';
import { success } from 'monadix/result';
import { kodimAuth } from '@kodim/auth';
import { createDrinks, Drink, findUserDrink, getUserDrinks } from './drinks.js';
import { getUser, users } from './users.js';
import * as dotenv from 'dotenv';
import { Errors } from './errors.js';

dotenv.config();

const port = process.env.PORT ?? 4000;

const drinks = createDrinks(`${process.env.SERVER_URL ?? ''}`);

const server = express();
const api = jsonder({
  serverUrl: process.env.SERVER_URL ?? '',
});

server.use(api.middleware());

server.use('/apidoc', express.static('docs/_site', {
  extensions: ['html'],
}));

server.use('/assets', express.static('assets'));

server.use('/api/me', kodimAuth());

server.get(
  '/api/me/drinks',
  api.endpoint({
    resourceType: 'drinks',
    handler: (req) => {
      const user = getUser(req.user!.email);
      return success(getUserDrinks(drinks, user));
    }
  })
);

server.get(
  '/api/me/drinks/:id',
  api.endpoint({
    resourceType: 'drink',
    handler: (req) => {
      const user = getUser(req.user!.email);
      const { id } = req.params;
      return findUserDrink(drinks, id, user).mapErr(() => ([
        Errors.drinkNotFound(id),
      ]));
    }
  })
);

server.patch(
  '/api/me/drinks/:id',
  api.endpoint({
    resourceType: 'drink',
    bodySchema: z.object({
      ordered: z.boolean({
        required_error: 'ordered is required',
        invalid_type_error: 'ordered must be a boolean',
      }),
    }),
    handler: (req) => {
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
      }).mapErr(() => ([
        Errors.drinkNotFound(id),
      ]));
    }
  })
);

server.get(
  '/api/admin/users',
  api.endpoint({
    resourceType: 'users',
    handler: () => success(users),
  })
);

server.use('/', express.static('frontend/dist'));

server.get('*', (req, resp) => {
  resp.sendFile('index.html', { root: 'frontend/dist' });
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
