export const handleError = (error: unknown, msg: string): never => {
  if (error instanceof Error) {
    const newError = new Error(`${msg}: ${error.message}`);
    newError.stack = error.stack;
    throw newError;
  }
  throw new Error(`${msg}: Unknown error type`);
};

export class PILFlavorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PILFlavorError";
  }
}
