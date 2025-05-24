import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { yRoute } from 'y-durableobjects';
import { Room } from "./room";
/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */


const app = new Hono();
app.use('*', cors());

const route = app.route('/room', yRoute<any>((env) => env.ROOM));

export default route;

export { Room };
