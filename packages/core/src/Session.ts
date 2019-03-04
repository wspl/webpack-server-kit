import { PassThrough } from 'stream'
import { Context, IContextOptions } from './Context'
import http from "http"
import * as path from 'path'

export interface ISession {
  on(event: 'keep-alive', listener: (value: boolean) => void): this
  on(event: 'headers', listener: (headers: { [key: string]: string }, statusCode: number) => void): this

  test(): Promise<boolean>
  run(): Promise<void>
}

export interface ISessionParameters {
  request?: http.IncomingMessage

  isHttp1?: boolean
  path?: string
  relativePath?: string
}

export abstract class Session<T extends Context<IContextOptions>> extends PassThrough implements ISession {
  public abstract params: ISessionParameters
  public abstract context: T
  abstract run (): Promise<void>
  abstract test (): Promise<boolean>

  get pathPrefix (): string {
    return this.context.options.pathPrefix
  }

  get path (): string {
    if (this.params.request) {
      return this.params.request.url
    } else if (this.params.relativePath) {
      return path.join(this.pathPrefix, this.params.relativePath)
    } else if (this.params.path) {
      return this.params.path
    } else {
      return ''
    }
  }

  get relativePath (): string {
    if (this.params.relativePath) {
      return this.params.relativePath
    } else {
      return this.path.slice(this.pathPrefix.length)
    }
  }

  get matchPrefix (): boolean {
    return this.path.startsWith(this.pathPrefix)
  }
}
