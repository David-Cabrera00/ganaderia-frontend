export class ApiError extends Error {
  public readonly status?: number;
  public readonly details?: Record<string, string[] | string>;

  constructor(
    message: string,
    status?: number,
    details?: Record<string, string[] | string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}