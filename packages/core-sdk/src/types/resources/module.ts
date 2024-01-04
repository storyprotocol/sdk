import { Hook } from "./hook";
import { QueryOptions } from "../options";

/**
 * Core data model for Module.
 *
 * @public
 */
export type Module = {
  id: string;
  ipOrgId: string;
  moduleKey: string;
  interface?: string;
  preHooks?: Hook[];
  postHooks?: Hook[];
};

/**
 * Request type for module.get method.
 *
 * @public
 */
export type GetModuleRequest = {
  moduleId: string;
};

/**
 * Response type for module.get method.
 *
 * @public
 */
export type GetModuleResponse = {
  module: Module;
};

/**
 * Request type for module.list method.
 *
 * @public
 */
export type ListModuleRequest = {
  ipOrgId?: string;
  options?: QueryOptions;
};

/**
 * Response type for module.list method.
 *
 * @public
 */
export type ListModuleResponse = {
  modules: Module[];
};
