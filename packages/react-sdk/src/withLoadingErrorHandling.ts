import { handleError } from "./util";

type AsyncFunction<T = unknown, U = unknown> = (args: T) => Promise<U>;
type SetLoadings = React.Dispatch<
  React.SetStateAction<Record<string, boolean>>
>;
type SetErrors = React.Dispatch<
  React.SetStateAction<Record<string, string | null>>
>;
export const withLoadingErrorHandling =
  <T, U>(
    actionName: string,
    method: AsyncFunction<T, U>,
    setLoadings: SetLoadings,
    setErrors: SetErrors
  ) =>
  async (request: T): Promise<U> => {
    try {
      setLoadings((prev) => ({ ...prev, [actionName]: true }));
      setErrors((prev) => ({ ...prev, [actionName]: null }));
      const response = await method(request);
      setLoadings((prev) => ({ ...prev, [actionName]: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, [actionName]: errorMessage }));
      setLoadings((prev) => ({ ...prev, [actionName]: false }));
      throw new Error(errorMessage);
    }
  };
