// Register IP
export {
  registrationModuleAbi,
  useWriteRegistrationModuleRegisterRootIp as useRegisterRootIp,
  useWriteRegistrationModuleRegisterDerivativeIp as useRegisterDerivativeIp,
} from "./generated/registrationModule";

// Licensing
export {
  licensingModuleAbi,
  useWriteLicensingModuleAddPolicyToIp as useAddPolicyToIp,
  useWriteLicensingModuleLinkIpToParents as useLinkIpToParents,
  useWriteLicensingModuleMintLicense as useMintLicense,
} from "./generated/licensingModule";

// IP Account
export { useSetPermission } from "./permissions";

// Policy
export {
  umlPolicyFrameworkManagerAbi,
  useWriteUmlPolicyFrameworkManagerRegisterPolicy as useRegisterUmlPolicy,
} from "./generated/UMLPolicyFrameworkManager";

// Dispute
export {
  disputeModuleAbi,
  useWriteDisputeModuleRaiseDispute as useRaiseDispute,
  useWriteDisputeModuleResolveDispute as useResolveDispute,
  useWriteDisputeModuleSetDisputeJudgement as useSetDisputeJudgement,
  useWriteDisputeModuleCancelDispute as useCancelDispute,
} from "./generated/disputeModule";

// IP Account
export {
  ipAccountImplAbi,
  useWriteIpAccountImplExecute as useIpAccountExecute,
} from "./generated/ipAccountImpl";
