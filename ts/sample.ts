import { configure } from "./config.js";
import { TokensFromRefresh } from "./model.js";
import { retrieveTokens, TokensFromStorage } from "./storage.js";
import { initiateAuth } from "./cognito-api.js";
import { setTimeoutWallClock } from "./util.js";

let schedulingRefresh: ReturnType<typeof _scheduleRefresh> | undefined =
  undefined;

/**
 * @description This function schedules a refresh of the data source, using the
 * provided `_.scheduleRefresh` method. It checks if scheduling is already in progress,
 * and if not, it sets `schedulingRefresh` to the result of calling `_scheduleRefresh`
 * with the provided arguments, followed by calling `finally` to reset `schedulingRefresh`
 * to undefined once the refresh has completed. The function returns `schedulingRefresh`.
 * 
 * @param { Parameters<typeof _scheduleRefresh> } args - The `args` input parameter
 * is used to pass any additional arguments that need to be passed to the
 * `_scheduleRefresh()` function when it is called. These arguments are passed directly
 * to the internal `_scheduleRefresh()` function without modification, allowing for
 * customization of the scheduling behavior if needed.
 * 
 * @returns { Promise } The function `scheduleRefresh` returns a promise that represents
 * the current state of scheduling refresh. If the function has not been called before,
 * it sets the variable `schedulingRefresh` to the result of calling `_scheduleRefresh`
 * with the provided arguments and then immediately clears the value of `schedulingRefresh`.
 * The returned promise will resolve when the refresh is scheduled or reject if an
 * error occurs.
 */
export async function scheduleRefresh(
  ...args: Parameters<typeof _scheduleRefresh>
) {
  if (!schedulingRefresh) {

    schedulingRefresh = _scheduleRefresh(...args).finally(
      () => (schedulingRefresh = undefined)
    );
  }
  return schedulingRefresh;
}

type TokensForRefresh = Partial<
  Pick<TokensFromStorage, "refreshToken" | "expireAt" | "username">
>;

let clearScheduledRefresh: ReturnType<typeof setTimeoutWallClock> | undefined =
  undefined;

/**
 * @description schedules a refresh of tokens at a time determined by their expiration
 * date, adding random jitter to spread scheduled refreshes across multiple components.
 * 
 * @param { AbortSignal } .abort - abort signal, which can be used to stop the scheduled
 * refresh of tokens by calling `clearScheduledRefresh`.
 * 
 * @param { (res: TokensFromRefresh) => void | Promise<void> } .tokensCb - callback
 * function that is triggered when the tokens are successfully retrieved from the API.
 * 
 * @param { (isRefreshing: boolean) => unknown } .isRefreshingCb - callback function
 * that is called whenever the `isRefreshing` state of the tokens changes, providing
 * the new value to the caller.
 * 
 * @returns { ` unknown`. } a timer ID that will be used to schedule a refresh of
 * tokens after a certain delay.
 * 
 * 		- `clearScheduledRefresh`: The clear schedule refresh callback, which is a
 * reference to a function that clears the scheduled refresh timer.
 * 		- `abort`: The abort signal, which is an optional parameter that can be used to
 * cancel the scheduled refresh.
 * 		- `tokensCb`: The tokens callback, which is an optional parameter that can be
 * used to handle the response of the token retrieval operation.
 * 		- `isRefreshingCb`: The is refreshing callback, which is an optional parameter
 * that can be used to handle the state of the refresh operation.
 */
async function _scheduleRefresh({
  abort,
  tokensCb,
  isRefreshingCb,
}: {
  abort?: AbortSignal;
  tokensCb?: (res: TokensFromRefresh) => void | Promise<void>;
  isRefreshingCb?: (isRefreshing: boolean) => unknown;
}) {
  const { debug } = configure();
  clearScheduledRefresh?.();
  const tokens = await retrieveTokens();
  if (abort?.aborted) return;
  // Refresh 30 seconds before expiry
  // Add some jitter, to spread scheduled refreshes might they be
  // requested multiple times (e.g. in multiple components)
  const refreshIn = Math.max(
    0,
    (tokens?.expireAt ?? new Date()).valueOf() -
      Date.now() -
      30 * 1000 -
      (Math.random() - 0.5) * 30 * 1000
  );
  if (refreshIn >= 1000) {
    debug?.(
      `Scheduling refresh of tokens in ${(refreshIn / 1000).toFixed(1)} seconds`
    );

    clearScheduledRefresh = setTimeoutWallClock(
      () =>
        refreshTokens({ abort, tokensCb, isRefreshingCb, tokens }).catch(
          (err) => debug?.("Failed to refresh tokens:", err)
        ),
      refreshIn
    );
    abort?.addEventListener("abort", clearScheduledRefresh);
  } else {
    refreshTokens({ abort, tokensCb, isRefreshingCb, tokens }).catch((err) =>
      debug?.("Failed to refresh tokens:", err)
    );
  }
  return clearScheduledRefresh;
}

let refreshingTokens: ReturnType<typeof _refreshTokens> | undefined = undefined;

/**
 * @description This function creates a new promise that waits for the tokens to be
 * refreshed. It returns a new promise each time it is called that only resolves when
 * the prior promise from the refresh completes
 * 
 * @param { Parameters } args - Nothing; the `args` input is currently unused.
 * 
 * @returns { Promise } Based on the code provided the `refreshTokens` function exports
 * an async function that takes parameters as input then checks if a flag `refreshingTokens
 * = undefined`, which is initially undefined at the beginning before it's set to
 * true later on through _ refreshTokens Function
 * When `refreshingTokens` is indeed set to true this means a call was made successfully
 * by ` refreshenTokens.finally()` when call `refreshTokenS finishes executing which
 * also sets the ` refreshingTokens' to ` undefined` so as not return anything until
 * then this indicates that if a subsequent ` refreshTokens ` function  were called
 * from within the execution of `_refresh tokens` it would be awaiting an uncertain
 * future with potential value .
 */
export async function refreshTokens(
  ...args: Parameters<typeof _refreshTokens>
) {
  if (!refreshingTokens) {
    refreshingTokens = _refreshTokens(...args).finally(
      () => (refreshingTokens = undefined)
    );
  }
  return refreshingTokens;
}

const invalidRefreshTokens = new Set<string>();

/**
 * @description This function is an async function named _refreshTokens that takes
 * options object which may have any of the following: abort (AbortSignal) - if this
 * signal is called it aborts the current function   isRefreshingCb (func)? which
 * takes a boolean is refreshing and should not be used inside callback as they don't
 * work inside func(), tokens (TokensForRefresh)  ? any existing tokens that could
 * possibly already have what they need; The rest are all callback functions to handle
 * results - either success (tokensFromRefresh), error with error message indicating
 * what token was unusable/bad; tokensCb() and isRefreshingCb are both optional (but
 * cannot both be set to undefined) and work as described for initTokensCb() above
 * They then proceed to attempt authentication flow by calling initiateAuth function
 * of configure with provided options . Once auth complete if refresh succeeded or
 * failed  a result is sent into token'sFromRefresh object which will have these
 * values regardless:   expireAt - what timestamp after start current token is no
 * good  (note that since they come back as number (i.e milliseconds since Epoch/January
 * 1 1970 00:00:00) that they already timesMultiplied this number for access and
 * refresh tokens by a factor of 1000. This gives the timeleft till refresh or access
 * tokens are invalid) idToken- This claims a unique identifier as a string token
 * which the auth result may have if successful authentication occurs (refresh is
 * different case with the auth being attempt to refresh instead just obtain from
 * initial authenticaton)) and acessstoken - likewise an accessible by bearer of its
 * respective string token (also for access or refresh.)    For error returned and
 * unusable/bad tokens the badToken(s) get tracked via a set. No function call or
 * async work may use result (tokensFromRefresh), so it does NOT change result directly
 * 
 * @param { object } abort,tokensCb,isRefreshingCb,tokens - The input parameters for
 * this asynchronous function refreshTokens are used to pass variables and callbacks
 * relevant to the process of refreshing authentication tokens. Here's a concise
 * description of each parameter:
 * 	- abort - An optional AbortSignal object that allows you to abort the request;
 * when passed to initiateAuth
 * 	- tokensCb- A optional callback function used to send the refreshed token when
 * completed successfully. (An asynchronous version is expected).
 * 	- isRefreshingCb- A callable function (async/await style recommended) indicating
 * whether authentication should be carried out asynchronously during refreshing.
 * This provides feedback when other functions should not continue before the auth
 * flow is finished.
 *   	- tokens - Current authentications tokens used to initiate authentication; may
 * be updated on successful refresh
 * 
 * @returns { Promise }
 */
async function _refreshTokens({
  abort,
  tokensCb,
  isRefreshingCb,
  tokens,
}: {
  abort?: AbortSignal;
  tokensCb?: (res: TokensFromRefresh) => void | Promise<void>;
  isRefreshingCb?: (isRefreshing: boolean) => unknown;
  tokens?: TokensForRefresh;
}): Promise<TokensFromRefresh> {
  isRefreshingCb?.(true);
  try {
    const { debug } = configure();
    if (!tokens) {
      tokens = await retrieveTokens();
    }
    const { refreshToken, username } = tokens ?? {};
    if (!refreshToken || !username) {
      throw new Error("Cannot refresh without refresh token and username");
    }
    if (invalidRefreshTokens.has(refreshToken)) {
      throw new Error(
        `Will not attempt refresh using token that failed previously: ${refreshToken}`
      );
    }
    debug?.("Refreshing tokens using refresh token ...");
    
/**
 * @description This function attempts to authenticate using a refresh token and adds
 * it to an invalid refresh tokens list if the authentication attempt fails.
 * 
 * @param { object } err - The input `err` catches any error that occur inside the
 * callback of `initiateAuth`. In case there is an error it adds the token to an array
 * of invalid tokens and throws the actual error returned by `initiateAuth()`
 */
    const authResult = await initiateAuth({
      authflow: "REFRESH_TOKEN_AUTH",
      authParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      abort,
    }).catch((err) => {
      invalidRefreshTokens.add(refreshToken);
      throw err;
    });
    const tokensFromRefresh: TokensFromRefresh = {
      accessToken: authResult.AuthenticationResult.AccessToken,
      idToken: authResult.AuthenticationResult.IdToken,
      expireAt: new Date(
        Date.now() + authResult.AuthenticationResult.ExpiresIn * 1000
      ),
      username,
    };
    await tokensCb?.(tokensFromRefresh);
    return tokensFromRefresh;
  } finally {
    isRefreshingCb?.(false);
  }
}
