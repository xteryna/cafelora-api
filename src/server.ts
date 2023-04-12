import express from 'express';
import { z } from 'zod';
import jsonder from 'jsonder';
import { success } from 'monadix/result';
import { kodimAuth } from '@kodim/auth';
import { createDrinks, Drink, findUserDrink, getUserDrinks } from './drinks.js';
import { getUser, users } from './users.js';
import { Errors } from './errors.js';

interface ServerOptions {
  serverUrl: string;
}

export const createServer = ({ serverUrl }: ServerOptions) => {
  const drinks = createDrinks(`${process.env.SERVER_URL ?? ''}`);

  const server = express();
  const api = jsonder({
    generateUrls: { serverUrl } 
  });

  server.use(api.middleware());

  server.use('/apidoc', express.static('docs/_site', {
    extensions: ['html'],
  }));

  server.use('/assets', express.static('assets'));

  server.use('/api/me', kodimAuth());

  server.get(
    '/api/me',
    api.endpoint({
      resourceType: 'user',
      handler: (req) => {
        const user = getUser(req.user!.email);
        return success(user);
      }
    })
  );

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
        return findUserDrink(drinks, id, user).orElse(() => ([
          Errors.drinkNotFound(id),
        ]));
      }
    })
  );

  server.patch(
    '/api/me/drinks/:id',
    api.endpoint({
      resourceType: 'drink',
      validation: {
        bodySchema: z.object({
          ordered: z.boolean({
            required_error: 'ordered is required',
            invalid_type_error: 'ordered must be a boolean',
          }),
        }),
      },
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
        }).orElse(() => ([
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

  return server;
};
