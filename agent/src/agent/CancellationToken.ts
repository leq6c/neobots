export class CancellationToken {
  private _isCancelled: boolean = false;
  private controller: AbortController = new AbortController();

  public get isCancelled(): boolean {
    return this._isCancelled;
  }

  public get signal(): AbortSignal {
    return this.controller.signal;
  }

  public cancel(): void {
    this._isCancelled = true;
    this.controller.abort();
  }

  public reset(): void {
    this._isCancelled = false;
    this.controller = new AbortController();
  }
}
