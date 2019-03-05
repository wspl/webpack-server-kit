# @webpack-server-kit/koa
This is an out-of-the-box Koa middleware for development of webpack-based project.

The features that this middleware brings are as follows:
- Serve the webpack-based web project without generating distribution files.
- Support hot module replacement.
- Allow project to be hosted under a subdirectory

## Getting Started

Installation:
```bash
npm install @webpack-server-kit/koa
# or use yarn:
yarn add @webpack-server-kit/koa
```

Integration with Koa:
```javascript
import Koa from 'koa'
import { WebpackDevMiddleware } from '@webpack-server-kit/koa'

// Need a webpack compiler instance can be passed to middleware.
const compiler = {/* webpack.Compiler */}

const app = new Koa()

// Use middleware
app.use(WebpackDevMiddleware(compiler))

// Other logic, such as server-side rendering
app.use(async ctx => {
  // ...
})

app.listen(3000)
```

Or if you want to serve project in a subdirectory with koa-router:
```javascript
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { WebpackDevMiddleware } from '@webpack-server-kit/koa'

// Need a webpack compiler instance can be passed to middleware.
const compiler = {/* webpack.Compiler */}

const app = new Koa()
const router = new KoaRouter()

app.use(router.routes())
app.use(router.allowedMethods())

router.get('/sub/*', WebpackDevMiddleware(compiler), async ctx => {
  // Other logic, such as server-side rendering
  // ...
})

app.listen(3000)
```
## API
Work in progress.
