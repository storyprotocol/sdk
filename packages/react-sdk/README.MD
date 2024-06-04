## Why we need to react version for sdk?

1. community lifecycle, and follow react best practice, such as react hook, combine life cycle
2. reduce some template code

## Scope

- Every module have a hook file
- Only export public method in a module
- Including states

**Expected result**

```ts
// useIpAsset
const [loadings, setLoadings] = useState(false);
const [errors, setErrors] = useState(false);
const registerRootIp = (request) => {
  try {
    setLoadings({
      ...loadings,
      registerRootIp: true,
    });
    const result = await client.ipAsset.registerRootIp(request);
    setLoadings({
      ...loadings,
      registerRootIp: false,
    });
    return result;
  } catch {
    setErrors({
      ...errors,
      registerRootIp: true,
    });
  }
};
const registerDerivativeIp = (request) => {
  try {
    setLoadings({
      ...loadings,
      registerDerivativeIp: true,
    });
    const result = await client.ipAsset.registerDerivativeIp(request);
    setLoadings({
      ...loadings,
      registerDerivativeIp: false,
    });
    return result;
  } catch {
    setErrors({
      ...errors,
      registerDerivativeIp: true,
    });
  }
};
return {
  registerRootIp,
  registerDerivativeIp,
  loadings,
  errors,
};
```

Usage

```ts
import { useIpAsset } from "./ipAsset";
const { registerRootIp, registerDerivativeIp, loadings, errors } = useIpAsset;
const result = await registerRootIp();
```

## Technical Stack

- ejs

## Issue

1. Do we need states like `loadings`, or `errors`
2. Do we need config client param or just keep the same as sdk
3. how to interact with wallet
- provider client, and every module capture by use Context ?
4. use source code or publish package
Recommend publish package