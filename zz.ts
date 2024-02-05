import { signOut } from "../common.js";
import { parseJwtPayload, setTimeoutWallClock } from "../util.js";
import { signInWithLink, requestSignInLink } from "../magic-link.js";
import {
  fido2CreateCredential,
  fido2DeleteCredential,
  fido2ListCredentials,
  fido2UpdateCredential,
  StoredCredential,
  authenticateWithFido2,
} from "../fido2.js";
import { authenticateWithSRP } from "../srp.js";
import { authenticateWithPlaintextPassword } from "../plaintext.js";
import { stepUpAuthenticationWithSmsOtp } from "../sms-otp-stepup.js";
import { configure } from "../config.js";
import { retrieveTokens, storeTokens, TokensFromStorage } from "../storage.js";
import { BusyState, IdleState, busyState } from "../model.js";
import { scheduleRefresh, refreshTokens } from "../refresh.js";
import {
  CognitoAccessTokenPayload,
  CognitoIdTokenPayload,
} from "../jwt-model.js";
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";

const PasswordlessContext = React.createContext<UsePasswordless | undefined>(
  undefined
);

/**
* @description Returns a context object for passwordless login if the
* PasswordlessContextProvider has been provided above it. Throws an error if the
* provider is missing.
* 
* @returns { object } Context object.
*/
export function usePasswordless() {
  const context = useContext(PasswordlessContext);
  if (!context) {
    throw new Error(
      "The PasswordlessContextProvider must be added above this consumer in the React component tree"
    );
  }
  return context;
}

const LocalUserCacheContext = React.createContext<
  UseLocalUserCache | undefined
>(undefined);

/**
* @description RETURN_CONTEXT: The function uses the 'useContext' hook to retrieve
* the value of the LocalUserCacheContext and checks if it exists before throwing an
* error message if it doesn't exist. If the LocalUserCacheContext is found to exist
* then the function returns the LocalUserCacheContext.
* 
* @returns {  } The exported function useLocalUserCache returns the context object.
*/
export function useLocalUserCache() {
  const context = useContext(LocalUserCacheContext);
  if (!context) {
    throw new Error(
      "The localUserCache must be enabled in the PasswordlessContextProvider: <PasswordlessContextProvider enableLocalUserCache={true}>"
    );
  }
  return context;
}

/**
* @description Provides a context provider for passwordless authentication that wraps
* the component with a local user cache context provider if enabled.
* 
* @param {  } props - Passes the component's child nodes.
* 
* @returns {  } The PasswordlessContextProvider component returns a div element with
* children from the prop provided. It is enclosed by PasswordlessContext and
* LocalUserCacheContextProvider to facilitate easy management of local user caching
* when needed.
*/
export const PasswordlessContextProvider = (props: {
  children: React.ReactNode;
  enableLocalUserCache?: boolean;
}) => {
  return (
    <PasswordlessContext.Provider value={_usePasswordless()}>
      {props.enableLocalUserCache ? (
        <LocalUserCacheContextProvider>
          {props.children}
        </LocalUserCacheContextProvider>
      ) : (
        props.children
      )}
    </PasswordlessContext.Provider>
  );
};

/**
* @description Providerizes a local user cache for React components by creating a
* Context.Provider component that wraps props.children and passes its return value
* to useLocalUserCache().
* 
* @param { object } props - Here is your response:
* 
* children: React.ReactNode;
* 
* @returns { object } Output is a react element of type object with properties of
* React.ReactNode and value of undefined.
*/
const LocalUserCacheContextProvider = (props: {
  children: React.ReactNode;
}) => {
  return (
    <LocalUserCacheContext.Provider value={_useLocalUserCache()}>
      {props.children}
    </LocalUserCacheContext.Provider>
  );
};

type Fido2Credential = StoredCredential & {
  update: (update: { friendlyName: string }) => Promise<void>;
  delete: () => Promise<void>;
  busy: boolean;
};

type UsePasswordless = ReturnType<typeof _usePasswordless>;

/**
* @description The provided export function "useAwaitableState" accepts type "T" and
* creates an object consisting of the following elements:
* - An awaitable Promise which when resolved sets awaited state value.
* - A reject element that captures error objects that occur during Promise resolution
* and displays it to the console when not properly resolved
* - Resolve function
* - Reject function
* 
* @param { T } state - The state parameter sets the value of the `awaited` state and
* triggers recalculation if it differs from the previous value.
* 
* @returns { object } The function returns an object with the following properties:
* 
* - `awaitable`: a Promise of type T
* - `resolve`: a function that takes the value of type T and resolves the promise
* - `reject`: a function that takes an error reason of type Error and rejects the promise
* - `awaited`: the currently awaited value or undefined
* 
* The `awaitable` property is a Reference to the most current Promise.
*/
export function useAwaitableState<T>(state: T) {
  const resolve = useRef<(value: T) => void>();
  const reject = useRef<(reason: Error) => void>();
  const awaitable = useRef<Promise<T>>();
  const [awaited, setAwaited] = useState<{ value: T }>();
/**
* @description sets the current awaitable promise to a new one with resolver and
* rejecter methods as their properties
*/
  const renewPromise = useCallback(() => {
/**
* @description ((_resolve/_reject) ⇒ { _resolve.current= _reject.current= _});
* 
* @param {  } _resolve - RESOLVE: Provides current functionality of the resolved
* promise for further use and setup for return.
* 
* @param {  } _reject - Here's a concise response directly answering your question
* with zero deviations:
* 
* The `_reject` input parameter sets its current value to `_reject`.
*/
/**
* @description Function takes two functions(_resolve and _reject), updates the current
* state of these functions to be able to await a return value from it later. If any
* value is returned it then returns this value to its waiting handler or sets up the
* rejected status if reject returns anything.
* 
* @param {  } value - The `value` input parameter sets `setAwaited()`'s input property
* to its current value.
* 
* @returns { string } The function takes two input functions `_resolve` and `_reject`,
* sets their current values to `resolve.current` and `reject.current`, respectively.
* It then returns a promise that resolves with the value returned by calling
* `setAwaited()` with argument `value`, and simultaneously returns that value.
*/
    awaitable.current = new Promise<T>((_resolve, _reject) => {
      resolve.current = _resolve;
      reject.current = _reject;
    })
      .then((value) => {
        setAwaited({ value });
        return value;
      })
      .finally(renewPromise);
  }, []);
  useEffect(renewPromise, [renewPromise]);
/**
* @description SETS AWAITED TO UNDEFINED USING STATE AS PARAMETER.
*/
  useEffect(() => setAwaited(undefined), [state]);
  return {
/**
* @description This function makes a read call on the result property of whatever
* value is held by the current (i.e., outer) promise to obtain the current awaitable
* (the value to be waited on) and return a new awaitable for that promise with an
* invocation that throws away that promise (therefore being the same effect as if
* it were called with () and nothing more would be done to delay propagation). This
* will make synchronously or asynchronously with the same effects what the immediately
* previous statement of await xxx() would accomplish (i.e., whether inside of
* xxx(()=>Promise1) => wait() or whatever else has to happen to ultimately cause it
* to throw a resolved/rejected event on awaiter). This behavior continues for all
* nesting levels.
*/
    awaitable: () => awaitable.current!,
/**
* @description Resolve.current(state): Invokes the current resolve method with state
* as argument; the return value is unspecified
*/
    resolve: () => resolve.current!(state),
/**
* @description Rejects the value with the specified error reason.
* 
* @param { Error } reason - Here is the answer to your question.
* 
* The `reason` input parameter supplies an error message when invoking the `reject()`
* function.
*/
    reject: (reason: Error) => reject.current!(reason),
    awaited,
  };
}
