import { TextDecoder, TextEncoder } from "util";

import $JSDOMEnvironment, {
  TestEnvironment as $TestEnvironment,
} from "jest-environment-jsdom";

/**
 * This patched JSDOMEnvironment serves as a proxy for the default JSDOMEnvironment from Jest.
 * It patches the global objects TextEncoder, TextDecoder, and Uint8Array
 * which are missing, or improperly implemented (Uint8Array is a node Buffer) in the JSDOM environment.
 *
 * A proxy pattern is used due to ES5 transpilation limitations, as direct
 * class extension isn't possible in ES5. The class delegates other methods
 * and properties to the original JSDOMEnvironment.
 *
 * We use this wrapper for full compatibility with browser global
 * objects in our Jest testing environment.
 */
class JSDOMEnvironment {
  private environment: $JSDOMEnvironment;

  constructor(...args: ConstructorParameters<typeof $JSDOMEnvironment>) {
    this.environment = new $JSDOMEnvironment(...args);
    this.environment.global.TextEncoder = TextEncoder;
    this.environment.global.TextDecoder =
      TextDecoder as typeof global.TextDecoder;
    this.environment.global.Uint8Array = Uint8Array;
    this.environment.global.Request = Request;
    this.environment.global.Response = Response;
    this.environment.global.Headers = Headers;
    this.environment.global.fetch = fetch;

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        } else {
          return Reflect.get(target.environment, prop, receiver);
        }
      },
      set: (target, prop, value) => {
        if (Reflect.has(target, prop)) {
          return Reflect.set(target, prop, value);
        } else {
          return Reflect.set(target.environment, prop, value);
        }
      },
    });
  }
}

const TestEnvironment =
  $TestEnvironment === $JSDOMEnvironment ? JSDOMEnvironment : $TestEnvironment;

export default JSDOMEnvironment;
export { TestEnvironment };
