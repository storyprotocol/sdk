import { QueryOptions } from "../options";
import { HookType } from "../../enums/HookType";

/**
 * Core data model for Hook.
 *
 * @public
 */
export type Hook = {
  id: string;
  moduleId: string;
  interface?: string;
  hookType: HookType;
  registryKey: string;
  registeredAt: string; // ISO 8601
  txHash: string;
};

/**
 * Request type for hook.get method.
 *
 * @public
 */
export type GetHookRequest = {
  hookId: string;
};

/**
 * Response type for hook.get method.
 *
 * @public
 */
export type GetHookResponse = {
  hook: Hook;
};

/**
 * Request type for hook.list method.
 *
 * @public
 */
export type ListHookRequest = {
  moduleId?: string;
  options?: QueryOptions;
};

/**
 * Response type for hook.list method.
 *
 * @public
 */
export type ListHookResponse = {
  hooks: Hook[];
};
