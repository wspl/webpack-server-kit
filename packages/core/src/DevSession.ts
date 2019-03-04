import { DevContext } from './DevContext'
import { PassThrough } from 'stream'
import { promisify } from 'util'
import * as path from 'path'
import * as mime from 'mime'
import { ISessionParameters, Session } from './Session'

export interface IDevSessionParameters extends ISessionParameters {}

export class DevSession extends Session<DevContext> {
  public isClosed = false

  private filePath: string

  constructor (public context: DevContext, public params: IDevSessionParameters = {}) {
    super()

    this.filePath = path.join(this.context.outputPath, this.relativePath)

    this.on('close', () => {
      this.isClosed = true
    })
  }

  async test () {
    if (!this.matchPrefix) return false
    if (!this.context.fs.existsSync(this.filePath)) return false
    if (this.context.fs.statSync(this.filePath).isDirectory()) {
      const defaultPagePath = path.join(this.filePath, this.context.options.defaultPage)
      if (!this.context.fs.existsSync(defaultPagePath)) return false
      this.filePath = defaultPagePath
    }
    return true
  }

  async run () {
    this.context.locked(() => {
      if (this.isClosed) return

      const contentSize = this.context.fs.readFileSync(this.filePath).length
      const contentType = mime.getType(this.filePath)

      this.emit('headers', {
        'Content-Type': contentType,
        'Content-Size': contentSize
      }, 200)

      const readStream = this.context.fs.createReadStream(this.filePath)
      readStream.pipe(this)
    })
  }
}
