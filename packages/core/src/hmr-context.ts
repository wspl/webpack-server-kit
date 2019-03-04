import * as webpack from 'webpack'
import { HmrSession, HmrSessionId, IHmrSessionParameters } from './hmr-session'
import { Context, IContextOptions } from './context'
import { setDefault } from './util'
import { packageName } from './constants'

interface IHmrContextOptions extends IContextOptions {
  path?: string
  heartbeatInterval?: number
}

type HmrAction = 'building' | 'built' | 'sync'

export class HmrContext extends Context<IHmrContextOptions> {
  public closed = false

  private nextSessionId: HmrSessionId = 0
  private sessionMap = new Map<HmrSessionId, HmrSession>()
  private heartbeatTimer: NodeJS.Timeout = null
  private latestStats: webpack.Stats = null

  constructor (public compiler: webpack.Compiler, public options: IHmrContextOptions = {}) {
    super()

    setDefault(options, 'pathPrefix', '')
    setDefault(options, 'path', '/__webpack_hmr')
    setDefault(options, 'heartbeatInterval', 1000)

    this.startHeartbeat()
    this.attachCompiler()
  }

  incoming (params?: IHmrSessionParameters): HmrSession {
    const session = new HmrSession(this, this.nextSessionId, params)
    this.sessionMap.set(session.id, session)
    this.nextSessionId += 1
    return session
  }

  removeSession (id: HmrSessionId) {
    this.sessionMap.delete(id)
  }

  close () {
    clearInterval(this.heartbeatTimer)
    this.closed = true

    this.sessionMap.forEach(session => {
      session.close()
    })
  }

  sync () {
    this.publish('sync', this.latestStats)
  }

  private startHeartbeat () {
    this.heartbeatTimer = setInterval(() => {
      this.sessionMap.forEach(session => {
        session.sendHeartbeat()
      })
    }, this.options.heartbeatInterval)
  }

  private attachCompiler () {
    this.compiler.hooks.invalid.tap(packageName, () => {
      if (this.closed) return
      this.latestStats = null

      // this.options.log('webpack building...')
      this.publish('building')
    })
    this.compiler.hooks.done.tap(packageName, stats => {
      if (this.closed) return
      this.latestStats = stats
      this.publish('built', stats)
    })
  }

  private publish (action: HmrAction, stats?: webpack.Stats) {
    if (stats) {
      const statsJson = stats.toJson({
        all: false,
        cached: true,
        children: true,
        modules: true,
        timings: true,
        hash: true
      })
      let bundles = [statsJson]
      if (statsJson.children && statsJson.children.length) {
        bundles = statsJson.children
      }

      bundles.forEach(bundle => {
        let name = bundle.name || ''
        if (bundles.length === 1 && !name && stats.compilation) {
          name = stats.compilation['name'] || ''
        }

        // this.options.log(`webpack built ${name} ${bundle.hash} in ${bundle.time} ms`)

        const modules = {}
        bundle.modules.forEach(module => modules[module.id] = module.name)

        this.sessionMap.forEach(session => {
          session.sendData({
            name,
            action,
            time: bundle.time,
            hash: bundle.hash,
            warnings: bundle.warnings || [],
            errors: bundle.errors || [],
            modules
          })
        })
      })
    } else {
      this.sessionMap.forEach(session => {
        session.sendData({action})
      })
    }
  }
}
