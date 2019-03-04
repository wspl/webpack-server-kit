import * as webpack from 'webpack'
import MemoryFileSystem = require('memory-fs')
import { DevSession, IDevSessionParameters } from './dev-session'
import { Context, IContextOptions } from './context'
import { setDefault } from './util'
import { packageName } from './constants'

export interface IDevContextOptions extends IContextOptions {
  defaultPage?: string
}

type LockedFn = () => void

export class DevContext extends Context<IDevContextOptions> {
  public fs: MemoryFileSystem = new MemoryFileSystem()

  private isLocked: boolean = true
  private lockedFns = new Set<LockedFn>()
  private watching: webpack.Watching = null

  constructor (public compiler: webpack.Compiler, public options: IDevContextOptions = {}) {
    super()

    setDefault(options, 'defaultPage', 'index.html')

    compiler.outputFileSystem = this.fs
    this.startWebpack()
    this.hookWebpack()
  }

  get outputPath () {
    return this.compiler.options.output.path
  }

  private startWebpack () {
    this.watching = this.compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err)
      }
    })
  }

  private lock () {
    this.isLocked = true
  }

  private unlock () {
    this.isLocked = false
    this.lockedFns.forEach(fn => {
      fn()
    })
    this.lockedFns.clear()
  }

  locked (fn: LockedFn) {
    if (this.isLocked) {
      this.lockedFns.add(fn)
    } else {
      fn()
    }
  }

  private hookWebpack () {
    this.compiler.hooks.watchRun.tap(packageName, () => {
      this.lock()
    })
    this.compiler.hooks.run.tap(packageName, () => {
      this.lock()
    })
    this.compiler.hooks.invalid.tap(packageName, () => {
      this.lock()
    })
    this.compiler.hooks.done.tap(packageName, () => {
      this.unlock()
    })
  }

  incoming (params?: IDevSessionParameters): DevSession {
    return new DevSession(this, params)
  }
}
