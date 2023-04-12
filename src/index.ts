import * as dotenv from 'dotenv';
import { createServer } from "./server.js";

dotenv.config();

const port = process.env.PORT ?? 4000;

const server = createServer({
  serverUrl: process.env.SERVER_URL ?? 'http://localhost:4000',
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});
