export interface IContextOptions {
  pathPrefix?: string
}

export abstract class Context<T extends IContextOptions> {
  public abstract options: T
}
