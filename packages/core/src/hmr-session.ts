import { EventEmitter } from 'events'
import { HmrContext } from './hmr-context'
import { ISessionParameters, Session } from './session'

export interface IHmrSessionParameters extends ISessionParameters {
  isHttp1?: boolean
}

export type HmrSessionId = number

export class HmrSession extends Session<HmrContext> {
  constructor (public context: HmrContext, public id: HmrSessionId, public params: IHmrSessionParameters = {}) {
    super()

    if (this.params.request) {
      this.params.request.socket.on('close', () => {
        this.close()
      })

      if (this.needSetKeepAlive) {
        this.params.request.socket.setKeepAlive(true)
      }
    }
  }

  get needSetKeepAlive () {
    if (this.params.request) {
      return !(parseInt(this.params.request.httpVersion) >= 2)
    } else {
      return this.params.isHttp1
    }
  }

  async test () {
    return this.relativePath === this.context.options.path
  }

  async run () {
    if (this.needSetKeepAlive) {
      this.emit('keep-alive', true)
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream;charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    }
    if (this.params.isHttp1) {
      headers['Connection'] = 'keep-alive'
    }
    this.emit('headers', headers, 200)

    this.write('\n')
    this.context.sync()
  }

  close () {
    this.emit('end')
    this.context.removeSession(this.id)
    this.emit('close')
  }

  sendData (payload) {
    this.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  sendHeartbeat () {
    this.write('data: \uD83D\uDC93\n\n')
  }
}
