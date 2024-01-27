import { QueryOptions } from "../options";

/**
 * Core data model for modules.
 *
 * @public
 */
export type Module = {
  name: string;
  module: `0x${string}`;
};

/**
 * Request type for module.get method.
 *
 * @public
 */
export type GetModuleRequest = {
  name: string;
};

/**
 * Response type for module.get method.
 *
 * @public
 */
export type GetModuleResponse = {
  data: Module;
};

/**
 * Response type for module.list method.
 *
 * @public
 */
export type ListModuleRequest = {
  options?: QueryOptions;
};

/**
 * Response type for module.list method.
 *
 * @public
 */
export type ListModuleResponse = {
  data: Module[];
};
