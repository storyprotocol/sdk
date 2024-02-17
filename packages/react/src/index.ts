export * from "./generated/registrationModule";
export * from "./generated/licensingModule";

export { useSetPermission } from "./permissions";

export * from "./generated/UMLPolicyFrameworkManager";
export { useWriteUmlPolicyFrameworkManagerRegisterPolicy as useRegisterUMLPolicy } from "./generated/UMLPolicyFrameworkManager";

export * from "./generated/disputeModule";
export { ipAccountImplAbi, useReadIpAccountImpl } from "./generated/ipAccountImpl";
