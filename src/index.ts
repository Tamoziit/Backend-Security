import { Hono } from 'hono'
import { aj } from './lib/arcjet';

const app = new Hono();

app.use('/*', async (c, next) => {
  const decision = await aj.protect(c.req.raw, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision.conclusion);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json({ error: "Too many requests" }, 429);
    } else if (decision.reason.isBot()) {
      return c.json({ error: "No bots allowed" }, 403);
    } else {
      return c.json({ error: "Forbidden" }, 403);
    }
  }

  next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
