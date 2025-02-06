export function handleError(error: unknown, msg: string): never {
  if (error instanceof Error) {
    const newError = new Error(`${msg}: ${error.message}`);
    newError.stack = error.stack;
    throw newError;
  }
  throw new Error(`${msg}: Unknown error type`);
}
