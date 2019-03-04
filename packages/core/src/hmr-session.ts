import { EventEmitter } from 'events'
import { HmrContext } from './hmr-context'
import { ISessionParameters, Session } from './session'

export interface IHmrSessionParameters extends ISessionParameters {}

export type HmrSessionId = number

export class HmrSession extends Session<HmrContext> {
  constructor (public context: HmrContext, public id: HmrSessionId, public params: IHmrSessionParameters = {}) {
    super()
  }

  async test () {
    return this.relativePath === this.context.options.path
  }

  async run () {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream;charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive'
    }
    this.emit('headers', headers, 200)

    this.write('\n')
    this.context.sync()
  }

  close () {
    this.end()
    this.context.removeSession(this.id)
  }

  sendData (payload) {
    this.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  sendHeartbeat () {
    this.write('data: \uD83D\uDC93\n\n')
  }
}
