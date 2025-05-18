import { DurableObject } from "cloudflare:workers";
import * as Y from 'yjs';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class Room extends DurableObject {
	/**
	 * The Durable Object's state is passed to the constructor and is used to
	 * 	manage the object's lifecycle and data
	 */
	clients: Set<WebSocket>;
	ydoc: Y.Doc;
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.clients = new Set<WebSocket>();
		this.ydoc = new Y.Doc();
	}

	async fetch(request: Request): Promise<Response> {

		if (request.headers.get("Upgrade") !== "websocket") {
			return new Response("Expected websocket", { status: 400 });
		}

		const [client, server] = Object.values(new WebSocketPair());
		this.handleSession(server);
		return new Response(null, { status: 101, webSocket: client });
	}

	handleSession(ws: WebSocket) {
		ws.accept();
		this.clients.add(ws);

		// **新規参加者に「今のドキュメント全体」を送る**
		const stateUpdate = Y.encodeStateAsUpdate(this.ydoc);
		ws.send(stateUpdate);

		ws.addEventListener("message", (event: MessageEvent) => {
			// クライアントからのupdateを適用
			let update: Uint8Array | null = null;
			if (event.data instanceof ArrayBuffer) {
				update = new Uint8Array(event.data);
			} else if (typeof event.data === "string") {
				return;
			}
			if (update) {
				this.applyAndBroadcast(update, ws);
			}
		});

		ws.addEventListener("close", () => {
			this.clients.delete(ws);
		});
	}

	applyAndBroadcast(update: Uint8Array, sender: WebSocket) {
		// DOのY.Docにapply
		Y.applyUpdate(this.ydoc, update);
		// 送ってきたクライアント以外に配信
		for (const client of this.clients) {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(update);
			}
		}
	}
}
