import 'mocha'
import * as http from 'http'
import * as agent from 'supertest'
import { HmrContext } from '../src/hmr-context'
import * as webpack from 'webpack'
import assert = require('assert')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('hmr', () => {
  let hmr, compiler, tapInvalid, tapDone, createSession

  beforeEach(async () => {
    compiler = {
      hooks: {
        invalid: {
          tap: (_, cb) => tapInvalid = cb,
        },
        done: {
          tap: (_, cb) => tapDone = cb
        }
      }
    } as any as webpack.Compiler
    hmr = new HmrContext(compiler)

    createSession = request => hmr.incoming({request})
  })



  it('should match url "/__webpack_hmr"', async () => {
    const session = createSession({url: '/__webpack_hmr'})
    assert(await session.test())
    session.close()
  })

  it('should set headers and status code', async () => {
    const session = createSession({url: '/__webpack_hmr'})
    assert.ok(await session.test())
    let headers, statusCode
    session.on('headers', (h, s) => {
      headers = h
      statusCode = s
    })
    await session.run()
    assert(headers && statusCode)
    assert(/^text\/event-stream\b/.test(headers['Content-Type']))
    assert(statusCode === 200)
    session.close()
  })
})
