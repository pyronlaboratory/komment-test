import { configure } from "./config.js";
import { TokensFromRefresh } from "./model.js";
import { retrieveTokens, TokensFromStorage } from "./storage.js";
import { initiateAuth } from "./cognito-api.js";
import { setTimeoutWallClock } from "./util.js";

let schedulingRefresh: ReturnType<typeof _scheduleRefresh> | undefined =
  undefined;

/**
 * @description This function creates a new scheduleRefresh function and assigns it
 * to schedulingRefresh only if there isn't already a value for it. The value that
 * gets returned at the end is assigned after being assigned the results of
 * scheduleRefresh. In essence then:
 * - Does not execute anything until .finally
 * - Returns whatever is given to _scheduleRefresh and assigns its value back to undefined
 * 
 * @param { Parameters } args - No problem; here's your answer:
 * 
 * The input parameters passed into the `export async function scheduleRefresh` are
 * destructured using Parameters. It is calling another function and then finishing
 * up by defining a variable 'schedulingRefresh' that equals undefined after completion
 * of this whole process .
 * 
 * @returns { Promise } This export function scheduleRefresh is used as a wrapped
 * around another function with an argument to take like this `_scheduleRefresh(...args)`
 * then return promise of `schedule refresh`  which first parameter  set to be false
 * then pass to original function `_scheduleRefresh` and set to finish or fulfilled
 * once this `original function ` returns promising after fulfilled then sets back
 * to undefine so no scheduled function should run twice by setting back again. The
 * output is a promise from  original schedule refresh and only ran only once if it
 * doesn't has already schedule previously set
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
 * @description This function schedules a refresh of tokens based on their expiration
 * time. It takes an object with three callback functions and schedules the refresh
 * up to 30 seconds before expiry. If the refresh is cancelled (aborted), it clears
 * the scheduled refresh.
 * 
 * @param { string } abort,tokensCb,isRefreshingCb - The input parameters `abort`,
 * `tokensCb`, and `isRefreshingCb` serve as options to control the behavior of the
 * scheduled token refresh process.
 * 
 * - `abort` is an abort signal that can be used to cancel the token refresh process
 * if needed
 * - `tokensCb` is a callback function that will be called when tokens are successfully
 * retrieved and should be processed.
 * - `isRefreshingCb` is a callback function that will be notified every time there
 * is an active token refresh schedule
 * 
 * @returns { object } This function schedules a refresh of tokens to be performed
 * after a certain amount of time. The output returned by the function is a clear
 * function that can be used to cancel the scheduled refresh. The function takes three
 * optional arguments: `abort`, `tokensCb`, and `isRefreshingCb` .
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

/**
 * @description This function schedules a callback to refresh Tokens after a specified
 * time(refreshIn), using the abort callback , isRefreshingCb and tokens CB for error
 * handling.
 */
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
