// All hooks and generated code are exported from here
export * from "./generated/registrationModule";
export * from "./generated/licensingModule";
export * from "./generated/UMLPolicyFrameworkManager";
export * from "./generated/disputeModule";
export * from "./generated/ipAccountImpl";

// Rename hooks for better DX
export { useWriteUmlPolicyFrameworkManagerRegisterPolicy as useRegisterUMLPolicy } from "./generated/UMLPolicyFrameworkManager";

// Wrapper hooks for better DX
export { useSetPermission } from "./permissions";
