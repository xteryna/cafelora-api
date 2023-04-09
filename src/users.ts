import { nanoid } from "nanoid";

export interface User {
  id: string;
  email: string,
  orders: string[],
}

export const users: User[] = [
  {
    id: nanoid(8),
    email: 'podlouckymartin@gmail.com',
    orders: ['espresso', 'romano'],
  }
];

export const getUser = (email: string): User => {
  let user = users.find((user) => user.email === email);

  if (user === undefined) {
    user = { id: nanoid(8), email, orders: []};
    users.push(user);
  }

  return user;
};
