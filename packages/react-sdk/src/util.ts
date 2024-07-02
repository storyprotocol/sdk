export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else {
    return "Unhandled error type";
  }
};
