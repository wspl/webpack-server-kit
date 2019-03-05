# @webpack-server-kit/express
This is an out-of-the-box Express middleware for development of webpack-based project.

The features that this middleware brings are as follows:
- Serve the webpack-based web project without generating distribution files.
- Support hot module replacement.
- Allow project to be hosted under a subdirectory

## Getting Started

Installation:
```bash
npm install @webpack-server-kit/express
# or use yarn:
yarn add @webpack-server-kit/express
```

Integration with Express:
```javascript
import Express from 'express'
import { WebpackDevMiddleware } from '@webpack-server-kit/express'

const app = Express()

// Use middleware
app.use(WebpackDevMiddleware())

// Other logic, such as server-side rendering
app.use((req, res) => {
  // ...
})

app.listen(3000)
```

Or if you want to serve project in a subdirectory with express router:
```javascript
import Express from 'express'
import { WebpackDevMiddleware } from '@webpack-server-kit/express'

const app = Express()

app.get('/sub/*', WebpackDevMiddleware(), (req, res) => {
  // Other logic, such as server-side rendering
  // ...
})

app.listen(3000)
```
## API
Work in progress.
