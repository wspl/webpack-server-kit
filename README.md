# webpack-server-kit
A re-implementation of webpack development server logic.

You can create a webpack development server with this library on any server framework. In addition, this library supports working on subdirectory.

Of course, We provide the out-of-the-box middleware for express and koa.

This is an alternative (in a sense) of `webpack-dev-middleware` and `webpack-hmr-midlleware`.

## Middleware
If you plan to use it directly on Koa and Express, please refer to:

- [Express](packages/express)
- [Koa](packages/koa)

## Usage
We will show you how to integrate this library with other web servers.

Here we use Node's native http module as an example.

First, install the core library:

```bash
npm install @webpack-server-kit/core
# or use yarn:
yarn add @webpack-server-kit/core
```
Next, create service contexts and modify server's response handler:
```javascript
import http from 'http'
import { DevContext, HmrContext } from '@webpack-server-kit/core'

// Need a webpack compiler instance can be passed to contexts.
const compiler = {/* webpack.Compiler */}

// Dev server support: serve the webpack compiled files.
const dev = new DevContext(compiler)
// Hmr support: enable hmr service.
const hmr = new HmrContext(compiler)

// Create a server with an asynchronous request handler.
http.createServer(async (req, res) => {
  // Handle the request and
  // pass http.IncomingRequest to request parameter.
  const devSession = dev.incoming({request: req})
  const hmrSession = hmr.incoming({request: req})
  
  // Determine which service this request matches
  const session = await devSession.test() ? devSession
    : await hmrSession.test() ? hmrSession
    : null
    
  if (session) {
    session.on('headers', (headers, status) => {
      res.set(headers)
      res.status(status)
    })
    session.pipe(res)
    // Respond to request.
    // (Must be after the bind operations)
    await session.run()
  } else {
    // Handling requests outside of the service,
    // such as handling server-side rendering logic or returning 404.
  }
}).listen(3000)
```
Then you need to enable hot module replacement (if you need) in your webpack config:

1. Add HMR plugin to the plugins array:
    ```javascript
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ]
    ```

2. Add `webpack-hot-middleware/client` into the entry array.

    ```javascript
    entry: [
     'webpack-hot-middleware/client',
     'index.js' // or your custom entry
    ]
    ```

    This step relies on the original [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) library, so you need to add it as a dependency. (We plan to re-implement the client entry as a part of this library before the stable release.)

## API
Work in progress.

## License
See [LICENSE file](LICENSE).
