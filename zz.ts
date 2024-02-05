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

export function useLocalUserCache() {
  const context = useContext(LocalUserCacheContext);
  if (!context) {
    throw new Error(
      "The localUserCache must be enabled in the PasswordlessContextProvider: <PasswordlessContextProvider enableLocalUserCache={true}>"
    );
  }
  return context;
}

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

function _usePasswordless() {
  const [signingInStatus, setSigninInStatus] = useState<BusyState | IdleState>(
    "CHECKING_FOR_SIGNIN_LINK"
  );
  const [
    initiallyRetrievingTokensFromStorage,
    setInitiallyRetrievingTokensFromStorage,
  ] = useState(true);
  const [tokens, _setTokens] = useState<TokensFromStorage>();
  const [tokensParsed, setTokensParsed] = useState<{
    idToken: CognitoIdTokenPayload;
    accessToken: CognitoAccessTokenPayload;
    expireAt: Date;
  }>();
  const setTokens: typeof _setTokens = useCallback((reactSetStateAction) => {
    _setTokens((prevState) => {
      const newTokens =
        typeof reactSetStateAction === "function"
          ? reactSetStateAction(prevState)
          : reactSetStateAction;
      const { idToken, accessToken, expireAt } = newTokens ?? {};
      if (idToken && accessToken && expireAt) {
        setTokensParsed({
          idToken: parseJwtPayload<CognitoIdTokenPayload>(idToken),
          accessToken: parseJwtPayload<CognitoAccessTokenPayload>(accessToken),
          expireAt,
        });
      } else {
        setTokensParsed(undefined);
      }
      return newTokens;
    });
  }, []);
  const [lastError, setLastError] = useState<Error>();
  const [
    userVerifyingPlatformAuthenticatorAvailable,
    setUserVerifyingPlatformAuthenticatorAvailable,
  ] = useState<boolean>();
  const [creatingCredential, setCreatingCredential] = useState(false);
  const [fido2Credentials, setFido2Credentials] = useState<Fido2Credential[]>();
  const updateFido2Credential = useCallback(
    (update: { credentialId: string } & Partial<Fido2Credential>) =>
      setFido2Credentials((state) => {
        if (!state) return state;
        const index = state.findIndex(
          (i) => i.credentialId === update.credentialId
        );
        if (index === -1) return state;
        // eslint-disable-next-line security/detect-object-injection
        state[index] = { ...state[index], ...update };
        return [...state];
      }),
    []
  );
  const deleteFido2Credential = useCallback(
    (credentialId: string) =>
      setFido2Credentials((state) =>
        state?.filter(
          (remainingAuthenticator) =>
            credentialId !== remainingAuthenticator.credentialId
        )
      ),
    []
  );
  const [isSchedulingRefresh, setIsSchedulingRefresh] = useState<boolean>();
  const [isRefreshingTokens, setIsRefreshingTokens] = useState<boolean>();
  const [showAuthenticatorManager, setShowAuthenticatorManager] =
    useState(false);
  const [recheckSignInStatus, setRecheckSignInStatus] = useState(0);

  // At component mount, attempt sign-in with link
  // This is a no-op, if there's no secret hash in the location bar
  useEffect(() => {
    setLastError(undefined);
    const signingIn = signInWithLink({
      statusCb: setSigninInStatus,
      tokensCb: (tokens) => storeTokens(tokens).then(() => setTokens(tokens)),
    });
    signingIn.signedIn.catch(setLastError);
    return signingIn.abort;
  }, [setTokens]);
  const busy = busyState.includes(signingInStatus as BusyState);

  // Schedule token refresh
  const refreshToken = tokens?.refreshToken;
  const expireAtTime = tokens?.expireAt?.getTime();
  useEffect(() => {
    if (refreshToken) {
      const abort = new AbortController();
      scheduleRefresh({
        abort: abort.signal,
        tokensCb: (newTokens) =>
          newTokens &&
          storeTokens(newTokens).then(() =>
            setTokens((tokens) => ({ ...tokens, ...newTokens }))
          ),
        isRefreshingCb: setIsRefreshingTokens,
      }).finally(() => setIsSchedulingRefresh(false));
      return () => abort.abort();
    }
  }, [setTokens, refreshToken, expireAtTime]);

  // If we have some tokens, but not all, attempt a refresh
  // (looks like e.g. a developer deleted some keys from storage)
  if (
    tokens &&
    (!tokens.idToken || !tokens.accessToken || !tokens.expireAt) &&
    !isRefreshingTokens &&
    !isSchedulingRefresh
  ) {
    refreshTokens({
      tokensCb: (newTokens) =>
        newTokens &&
        storeTokens(newTokens).then(() =>
          setTokens((tokens) => ({ ...tokens, ...newTokens }))
        ),
      isRefreshingCb: setIsRefreshingTokens,
    }).catch(() => {
      setTokens(undefined);
    });
  }

  // At component mount, load tokens from storage
  useEffect(() => {
    retrieveTokens()
      .then(setTokens)
      .finally(() => setInitiallyRetrievingTokensFromStorage(false));
  }, [setTokens]);

  // Give easy access to isUserVerifyingPlatformAuthenticatorAvailable
  useEffect(() => {
    if (typeof PublicKeyCredential !== "undefined") {
      const cancel = new AbortController();
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((res) => {
          if (!cancel.signal.aborted) {
            setUserVerifyingPlatformAuthenticatorAvailable(res);
          }
          return () => cancel.abort();
        })
        .catch((err) => {
          const { debug } = configure();
          debug?.(
            "Failed to determine if a user verifying platform authenticator is available:",
            err
          );
        });
    } else {
      setUserVerifyingPlatformAuthenticatorAvailable(false);
    }
  }, []);

  const toFido2Credential = useCallback(
    (credential: StoredCredential) => {
      return {
        ...credential,
        busy: false,
        update: async (update: { friendlyName: string }) => {
          updateFido2Credential({
            credentialId: credential.credentialId,
            busy: true,
          });
          return fido2UpdateCredential({
            ...update,
            credentialId: credential.credentialId,
          })
            .catch((err) => {
              updateFido2Credential({
                credentialId: credential.credentialId,
                busy: false,
              });
              throw err;
            })
            .then(() =>
              updateFido2Credential({
                ...update,
                credentialId: credential.credentialId,
                busy: false,
              })
            );
        },
        delete: async () => {
          updateFido2Credential({
            credentialId: credential.credentialId,
            busy: true,
          });
          return fido2DeleteCredential({
            credentialId: credential.credentialId,
          })
            .catch((err) => {
              updateFido2Credential({
                credentialId: credential.credentialId,
                busy: false,
              });
              throw err;
            })
            .then(() => deleteFido2Credential(credential.credentialId));
        },
      };
    },
    [deleteFido2Credential, updateFido2Credential]
  );

  // Determine sign-in status
  const signInStatus = useMemo(() => {
    recheckSignInStatus; // dummy usage otherwise eslint complains we should remove it from the dep array
    return tokensParsed && tokensParsed.expireAt.valueOf() >= Date.now()
      ? ("SIGNED_IN" as const)
      : tokensParsed && (isSchedulingRefresh || isRefreshingTokens)
      ? ("REFRESHING_SIGN_IN" as const)
      : busyState
          .filter(
            (state) =>
              !["SIGNING_OUT", "CHECKING_FOR_SIGNIN_LINK"].includes(state)
          )
          .includes(signingInStatus as BusyState)
      ? ("SIGNING_IN" as const)
      : initiallyRetrievingTokensFromStorage ||
        signingInStatus === "CHECKING_FOR_SIGNIN_LINK"
      ? ("CHECKING" as const)
      : signingInStatus === "SIGNING_OUT"
      ? ("SIGNING_OUT" as const)
      : ("NOT_SIGNED_IN" as const);
  }, [
    tokensParsed,
    isSchedulingRefresh,
    isRefreshingTokens,
    signingInStatus,
    initiallyRetrievingTokensFromStorage,
    recheckSignInStatus, // if this increments we should redetermine the signInStatus
  ]);

  // Check signInStatus upon token expiry
  useEffect(() => {
    if (!tokens?.expireAt) return;
    const checkIn = tokens.expireAt.valueOf() - Date.now();
    if (checkIn < 0) return;
    return setTimeoutWallClock(() => {
      const { debug } = configure();
      debug?.(
        "Checking signInStatus as tokens have expired at:",
        tokens.expireAt?.toISOString()
      );
      setRecheckSignInStatus((s) => s + 1);
    }, checkIn);
  }, [tokens?.expireAt]);

export function useAwaitableState<T>(state: T) {
  const resolve = useRef<(value: T) => void>();
  const reject = useRef<(reason: Error) => void>();
  const awaitable = useRef<Promise<T>>();
  const [awaited, setAwaited] = useState<{ value: T }>();
  const renewPromise = useCallback(() => {
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
  useEffect(() => setAwaited(undefined), [state]);
  return {
    awaitable: () => awaitable.current!,
    resolve: () => resolve.current!(state),
    reject: (reason: Error) => reject.current!(reason),
    awaited,
  };
}
