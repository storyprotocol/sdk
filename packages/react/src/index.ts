// Register IP
export {
  useWriteRegistrationModuleRegisterRootIp as useWriteRegisterRootIp,
  useWriteRegistrationModuleRegisterDerivativeIp as useWriteRegisterDerivativeIp,
} from "./generated/registrationModule";

// Permissions
export { useWriteAccessControllerSetPermission } from "./generated/accessController";

// License
export { useWriteLicenseRegistryMintLicense } from "./generated/licenseRegistry";

export {
  useWriteLicensingModuleAddPolicyToIp as useAddPolicyToIp,
  useWriteLicensingModuleLinkIpToParents as useLinkIpToParents,
} from "./generated/licensingModule";

// IP Account
export { useSetPermission } from "./ipAccount";
