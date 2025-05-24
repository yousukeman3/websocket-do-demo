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




export default {
  async fetch(req: Request, env: any): Promise<Response> {
    const url = new URL(req.url)

    // 1) Upgrade ヘッダーで WebSocket か判定
    if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      // 2) 自分で WebSocketPair を作成
      const { 0: client, 1: server } = new WebSocketPair()

      // 3) 片方(server) を Durable Object に渡す
      const id = env.ROOM.idFromName(url.pathname.split('/')[2] || 'default')
      env.ROOM.get(id).fetch(req, { ws: server } as any)   // ← 2nd param が DO への WebSocket

      // 4) もう片方(client) をブラウザに返す
      return new Response(null, { status: 101, webSocket: client })
    }

    // HTTP リクエストとして扱う場合（health-check など）
    return new Response('Need WebSocket upgrade', { status: 426 })
  },
}

export { Room };
