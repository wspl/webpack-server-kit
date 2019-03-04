import * as Koa from 'koa'
import * as webpack from 'webpack'
import { IDevContextOptions, IHmrContextOptions, DevContext, HmrContext } from '@webpack-server-kit/core'
import { PassThrough } from 'stream'

export interface IWebpackDevMiddlewareOptions extends IDevContextOptions, IHmrContextOptions {}

export function WebpackDevMiddleware(
  compiler: webpack.Compiler,
  options: IWebpackDevMiddlewareOptions = {}
): Koa.Middleware {
  const dev = new DevContext(compiler, options)
  const hmr = new HmrContext(compiler, options)
  return async function (ctx, next) {
    let pathPrefix
    if (ctx._matchedRoute) {
      // route path like: '/subdir/*'
      pathPrefix = ctx._matchedRoute.replace(/\/\*$/, '')
    }
    const devSession = dev.incoming({request: ctx.req, pathPrefix})
    const hmrSession = hmr.incoming({request: ctx.req, pathPrefix})
    const session = await devSession.test() ? devSession : await hmrSession.test() ? hmrSession : null
    if (session) {
      ctx.body = new PassThrough()
      session.on('headers', (headers, status) => {
        ctx.set(headers)
        ctx.status = status
      })
      session.pipe(ctx.body)
      await session.run()
    } else {
      await next()
    }
  }
}
