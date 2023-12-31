import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { getD1DataByTable } from "../data/d1-data";
import { getById } from "../data/kv-data";
import { decode } from 'hono/jwt';

const status = new Hono<{ Bindings: Bindings }>();

status.get("/", async (ctx) => {
  console.log("status", Date());
  var status = {};
  status.headers = ctx.req.headers;
  //parse cookie
  status.CF_Authorization = 'not set';
  if (ctx.req.cookie("CF_Authorization")) {
    const tokenToDecode = ctx.req.cookie("CF_Authorization");
    const { header, payload } = decode(tokenToDecode)
    status.CF_Authorization = payload;
    status.CF_Authorization_header = header;
  }


  status.webServer = "ok";

  //D1
  try {
    const { results } = await ctx.env.D1DATA.prepare(
      "SELECT * FROM users"
    ).all();
    status.d1 = "ok";
  } catch (error) {
    status.d1 = "error: " + error;
  }

  //drizzle
  try {
    const d1Data = await getD1DataByTable(ctx.env.D1DATA, "users", {
      limit: 1,
    });
    status.drizzle = "ok";
  } catch (error) {
    status.drizzle = "error: " + error;
  }

  //kv
  try {
    const allCacheItems = await getById(ctx.env.KVDATA, "1");
    status.kv = "ok";
  } catch (error) {
    status.kv = "error: " + error;
  }

    //env
  try {
    status.env = ctx.env;
  } catch (error) {
    status.env = "error: " + error;
  }

  return ctx.json(status);
});

export { status };
