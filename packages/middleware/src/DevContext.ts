import * as webpack from 'webpack'
import MemoryFileSystem = require('memory-fs')
import { DevSession, IDevSessionParameters } from './DevSession'
import { Context, IContextOptions } from './Context'
import { setDefault } from './Util'

interface IDevContextOptions extends IContextOptions {
  defaultPage?: string
}

export class DevContext extends Context<IDevContextOptions> {
  private watching: webpack.Watching = null
  public fs: MemoryFileSystem = new MemoryFileSystem()

  constructor (
    public compiler: webpack.Compiler,
    public options: IDevContextOptions = {}) {
    super()

    setDefault(options, 'defaultPage', 'index.html')
    setDefault(options, 'pathPrefix', '')

    compiler.outputFileSystem = this.fs
    this.startWebpack()
  }

  get outputPath () {
    return this.compiler.options.output.path
  }

  startWebpack () {
    this.watching = this.compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err)
      }
    })
  }

  incoming (params?: IDevSessionParameters): DevSession {
    return new DevSession(this, params)
  }
}
