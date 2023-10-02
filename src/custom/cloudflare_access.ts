import { decode } from 'hono/jwt';

const decodeJwtMiddleware = async (ctx, next) => {
    console.log('decodeJwtMiddleware');
    
    try {
        const tokenToDecode = ctx.req.cookie("CF_Authorization");
        const { header, payload } = decode(tokenToDecode);
        console.log('payload', payload);
        console.log('header', ctx.req);
        ctx.set('x-cf-email', payload.email);
        ctx.set('x-cf-payload', payload);
      } catch (error) {
        console.log('error', error);
      }

      await next()
  };

export { decodeJwtMiddleware };