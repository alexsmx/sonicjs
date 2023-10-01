import { Hono } from "hono";

import { api } from "./cms/api/api";
import { Bindings } from "./cms/types/bindings";
import { admin } from "./cms/admin/admin";
import { example } from "./custom/example";
import { status } from "./cms/api/status";
import { hello } from "./custom/hello"; 

const app = new Hono<{ Bindings: Bindings }>()

app.get("/", async (ctx) => {
  return ctx.redirect('/admin');
});

app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req.raw);
});

app.route('/v1', api)
app.route('/admin', admin)
app.route('v1/example', example)
app.route('/status', status)
app.route('/v1/hello', hello)
export default app;
