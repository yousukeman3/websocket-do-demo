/** A Durable Object's behavior is defined in an exported Javascript class */
import { YDurableObjects } from 'y-durableobjects'

export class Room extends YDurableObjects<Env> {

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)
	}

}
