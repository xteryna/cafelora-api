import { Drink } from "./drinks.js";

export interface User {
  email: string,
  orders: string[],
}

export const users: User[] = [
  {
    email: 'podlouckymartin@gmail.com',
    orders: ['espresso', 'romano'],
  }
];

export const getUser = (email: string): User => {
  let user = users.find((user) => user.email === email);

  if (user === undefined) {
    user = { email, orders: []};
  }

  users.push(user);
  return user;
};
