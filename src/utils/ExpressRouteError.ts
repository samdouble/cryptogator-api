export class ExpressRouteError extends Error {
  code: number;
  response: { error: string };

  constructor(code, error) {
    super(`${code}`);
    this.name = 'ExpressRouteError';
    this.code = code;
    this.response = { error };
  }
}
