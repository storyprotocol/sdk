import { Address } from "viem";

import { QueryOptions } from "../options";

/**
 * Core data model for modules.
 *
 * @public
 */
export type Module = {
  name: string;
  module: Address;
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
  module: Address;
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
  modules: Module[];
};
