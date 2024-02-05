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
 * @description Returns the context if the PasswordlessContext is provided; throws
 * an error otherwise
 * 
 * @returns { object } The output of the given function is the `PasswordlessContext`
 * object when it exists. otherwise the function throws an error stating that the
 * `PasswordlessContextProvider` must be added above this consumer component.
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
 * @description Retrieves the Local User Cache Context and returns it if it exists.
 * Otherwise throws an error stating that the LocalUserCache must be enabled within
 * a PasswordlessContextProvider component.
 * 
 * @returns {  } The output of the function is a Local User Cache Context object. If
 * no such object exists for the application when calling the exported useLocalUserCache(),
 * an error message that says the user cache has to be enabled on PasswordlessContextProvider
 * before usage gets returned.
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
 * @description Creates a React context provider for passwordless authentication and
 * caches the user locally if enabled. Provides the children prop with a
 * PasswordlessContext.Provider containing either the cached local user or the direct
 * children component if no caching is enabled.
 * 
 * @param { boolean } props - The `props` input parameter passes a JavaScript object
 * to the `PasswordlessContextProvider` component when it is being rendered. This
 * object has two properties: "children" and "enableLocalUserCache?"
 * 
 * @returns { Component } The PasswordlessContextProvider component returns a Provider
 * component with a value of _usePasswordless(), and nested Children component provided
 * by the props.
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
 * @description Providers a LocalUserCacheContext to the children of the component
 * 
 * @param {  } props - The `props` input parameter is the value passed to the functional
 * component that was provided at the time of the call and its type is `React.ReactNode`.
 * 
 * @returns {  } Provides a LocalUserCacheContext to its children.
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
 * @description Provides an awaitable state with resolving and rejecting functionality.
 * It returns an object containing the awaitable promise along with methods to resolve
 * or reject the promise and retrieve the awaited value.
 * 
 * @param { T } state - The `state` input parameter is used as the initial value for
 * the `awaited` state variable within the hook.
 * 
 * @returns { Promise } The function returns an object with four properties: 'awaitable',
 * 'resolve', 'reject', and 'awaited'. 'awaitable' is a () => Promise<T>; 'resolve'
 * and 'reject' are (value/reason: T) => void; 'awaited' is { value: T };
 */
export function useAwaitableState<T>(state: T) {
  const resolve = useRef<(value: T) => void>();
  const reject = useRef<(reason: Error) => void>();
  const awaitable = useRef<Promise<T>>();
  const [awaited, setAwaited] = useState<{ value: T }>();
/**
 * @description Initialize a new promise with provided callback functions for resolution
 * and rejection. Set an initial result through `then` and renew the promise on
 * finalization via `renewPromise`.
 */
  const renewPromise = useCallback(() => {
/**
 * @description The function updates the current properties of two variables (_resolve
 * and _reject) to the given values (_resolves and _rejections).
 * 
 * @param {  } _resolve - Of course. The input parameter `_resolve` here sets
 * `resolve.current` equal to the `_resolve`.
 * 
 * @param {  } _reject - REJECTS THE PROMISE: The underscore before `_reject` indicates
 * that it is a rejected promise that is being passed into the function.
 */
/**
 * @description RESOLVE.CURRENT AND REJECT.CURRENT ARE SET TO THE VALUES OF _RESOLVE
 * AND _REJECT BY THIS FUNCTION WHICH IS THEN RETURNED BY SETAUDATED
 * 
 * @param { any } value - In the given function callback(resolve/reject) returns
 * 'value' to then function.
 * 
 * @returns { any } The function takes two values as input and assigns them to the
 * current properties of a pair of promises - `resolve` and `reject`. It then returns
 * a promise that resolves to the value of the `value` parameter.
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
 * @description Setting Awaits Undefined
 * =====================
 */
  useEffect(() => setAwaited(undefined), [state]);
  return {
/**
 * @description Calling awaitable() returns the current value of the awaitable object.
 */
    awaitable: () => awaitable.current!,
/**
 * @description Here is the answer I can provide as you requested:
 * 
 * resolve() enables access to and modification of the current state by accepting an
 * argument state to be passed and returning it.
 */
    resolve: () => resolve.current!(state),
/**
 * @description Reject takes an object with a single property 'reason' and sends that
 * property as the current reason to whatever reject method is passed to it when called.
 * 
 * @param { Error } reason - Of course. Here is your answer to this specific question.
 * The only change I have made was to capitalize the word "Error" per your specification:
 * 
 * The reason input parameter provides the error details for a reject function return
 * value of reject.current(reason).
 */
    reject: (reason: Error) => reject.current!(reason),
    awaited,
  };
}
