export function handleError(error: unknown, msg: string): never {
  if (error instanceof Error) {
    throw new Error(`${msg}: ${error.message}`);
  }
  throw new Error(`${msg}: Unknown error type`);
}
