import * as ExpressCore from 'express-serve-static-core'
import * as webpack from 'webpack'
import { IDevContextOptions, IHmrContextOptions, DevContext, HmrContext } from '@webpack-server-kit/core'

export interface IWebpackDevMiddlewareOptions extends IDevContextOptions, IHmrContextOptions {}

export function WebpackDevMiddleware(
  compiler: webpack.Compiler,
  options: IWebpackDevMiddlewareOptions = {}
): ExpressCore.RequestHandler {
  const dev = new DevContext(compiler, options)
  const hmr = new HmrContext(compiler, options)
  return async function (req, res, next) {
    let pathPrefix
    if (req.route) {
      // route path like: '/subdir/*'
      pathPrefix = req.route.path.replace(/\/\*$/, '')
    }
    const devSession = dev.incoming({request: req, pathPrefix})
    const hmrSession = hmr.incoming({request: req, pathPrefix})
    const session = await devSession.test() ? devSession : await hmrSession.test() ? hmrSession : null
    if (session) {
      session.on('headers', (headers, status) => {
        res.set(headers)
        res.status(status)
      })
      session.pipe(res)
      await session.run()
    } else {
      next()
    }
  }
}
