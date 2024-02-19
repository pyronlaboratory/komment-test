import { configure } from "./config.js";
import { TokensFromRefresh } from "./model.js";
import { retrieveTokens, TokensFromStorage } from "./storage.js";
import { initiateAuth } from "./cognito-api.js";
import { setTimeoutWallClock } from "./util.js";


let schedulingRefresh: ReturnType<typeof _scheduleRefresh> | undefined =
  undefined;

/**
 * @description This is a simple wraper for the scheduleRefresh function. It takes
 * the same arguments that the function scheduleRefresh accepts and first checkes to
 * see if another schedule refresh operation has not been set up already.  If no
 * scheduled refresh is occuring it calls schedule refresh passing along any parameters
 * supplied. However before that function is runn it stores the schedulded refresh
 * reference inside a flag called 'scheduling refresh' This flag remains set until
 * teh originally scheduled refresh function returns finishing and only after then
 * does it reset itself  This has the effect of allowing further refreshes to be
 * initiated (and thusly store new refresh flags) but does so without stacking new
 * sets of refresh flags thus avoiding recursive re-refreshing
 * 
 * @param { Parameters } args - The input `args` paramater is used to pass parameter
 * values to `_scheduleRefresh` when calling it.
 * 
 * @returns { object } The output of this function is a Promise that will resolve to
 * nothing. When called with parameters ,it returns a promise for schedule refresh
 * .If the refresh was not already being scheduled the scheduleRefresha synchronous
 * version of _schedule refresh is returned and a new promise is created that will
 * return the result of _schedule Refresh. If however the refresh is being schedule
 * then  a new promiSee with nothing resolution Is returned. The finaly block makes
 * ensure that once the fresh  finishes aschedulining or canceling , scheduling refresh
 * Is set undefined
 * so its not accidentally scheduled again before the existing call has completed
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
 * @description This async function is scheduled refresh token. It sets a timer for
 * a refresh of tokens 30 seconds before expiry based on current timestamp. If multiple
 * schedules occur they are jittered with a randomization of  1.5 second before the
 * scheduled refresh time to prevent same requests and abort is checked after schedule
 * 
 * @param { object } abort,tokensCb,isRefreshingCb - The _scheduleRefresh function
 * takes an object with three parameters: abort?、 tokensCb?、 isRefreshingCb?; These
 * parameters are input parameters for the functions respective functions.
 * 
 * The abort ? Parameter is optional and allows you to specify an AbortSignal object
 * that can be used to stop the scheduled refresh before it occurs (aborting the
 * request). If you do not pass an abort parameter and this function has a value that
 * will call the reset function to cancel the timeout before its resolved， it will
 * attempt to get the tokens and then update isRefreshing .
 * 
 * The tokescb  parameter is optional callback to be called with retrieved Tokens
 * when this functions completed the request successfully. If the scheduled refresh
 * does not occur due to an abort or refreshTokens fails to retrieve fresh new tokken.,
 * This Callback will still Be called withe the old stale Tokens instance that has
 * previously been retrieved.
 * 
 * is Refreshing CB  a is optional callback function used for updating The local
 * isRefreshing State .  it receive  argument indcating if refresher running as truthy
 * , means thay function Should refresh toks  If falsy it means this funxtion shuold
 * end the current reFresh endeveaur
 * 
 * @returns { Promise } This function returns a clears setTimeout reference after
 * waiting for 'refreshIn' (30 seconds max) from the current time before attempting
 * to refresh the tokens. It includes various abort signal handling that can interrupt
 * this scheduling when called and additionally adds an event listener to the abort
 * signal.   The return type of clearScheduledRefresh makes sense because it sets a
 * new timeout that gets cancelled upon completion;
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
 * @description This function sets a timer to call the `refreshTokens()` function
 * after a delay using `setTimeout()`; the delay is defined by `refreshIn`. The
 * `refreshTokens()` function attempts to refresh the tokens and then calls the
 * `abort`, `tokensCb`, `isRefreshingCb`, and `tokens` callbacks with the result. If
 * an error occurs during token refreshment. it calls a debug function to log the error.
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
 * @description This function is a wrapper for the _refreshTokens function that
 * memoizes the result of calling _refreshTokens and returns it when called again.
 * It also sets a flag called "refreshingTokens" to "true" while the refresh tokens
 * are being fetched and sets it back to "undefined" once the process is complete or
 * if there was an error.
 * 
 * Essentially - if refreshTokens is already being refreshed - it returns the
 * previous/current result of _refreshTokens rather than waiting for a new one everytime.
 * 
 * @param { Parameters } args - Nothing. It is not used. This `args` input parameter
 * is there because it is a required parameter for the `refreshTokens()` function
 * defined elsewhere. The exported function simply calls that other function (with
 * any arguments provided), captures its result with a variable (but ignores whatever
 * that result is), and returns nothing (`undefined`).
 * 
 * @returns {  } The function "refreshTokens" takes variadic parameters and returns
 * a promise that will be resolved after a call to another function _refreshTokens.
 * The promise returns from refreshTokens first resolves as an undefined value and
 * holds the results of calling _refreshtoken while true (refreshingToken defined)
 * when resolved(undefined), has no data attached as _refreshTokens holds the values
 * itself and will not be attached back into the returned value by then . Once done
 * being used and set to undefined is then not a promise any longer because undefined
 * !== promised; however can not confirm the output type definitively  without seeing
 * that function_ or its definitions.. However we can tell this should work(be used
 * as refreshTokens() returns true) once called properly by its owner because an
 * initial function _freshen would allow for correct state refreshing from one point
 * and pass proper function results when undefined are returned.
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
 * @description This function asynchronous function refreshes tokens by calling the
 * "initiateAuth" function and then updating the Tokens object with the new access
 * token or failing gracefully if the token is no longer valid
 * 
 * @param { boolean } abort,tokensCb,isRefreshingCb,tokens - Here is what the
 * documentation tells us:
 * 
 * - abort is an AbortSignal object used for canceling the promise returned by this
 * function
 * - tokensCb (optional) is a callback called when fresh tokens are successfully obtained
 * - isRefreshingCb is an optional callback to receive an indicator of whether the
 * refresh is occurring (default returns 'void')
 * - tokens (also optional) contains a previously obtained access token and associated
 * expiration date to use with initiateAuth for client-initiated refresher attempts;
 * if tokens=null (or an empty object), a retrieval function retrieveTokens will be
 * used.
 * 
 * Are there any other questions?
 * 
 * @returns { Promise } This function takes several parameters including a callback.
 * The callback is given a fresh token when tokens are refreshed and any other parameter
 * besides abort which serves as a promise of reject.  Then if a call to "retrieveToken"
 * succeeds the result includes: access token from token provider (which comes via
 * result from "initiateAuth").  expire time calculated based on the expires-in token
 * attribute of fresh Access Token as obtained and finally both Access and Identity
 * Tokens as objects respectively accessed with .access_token & .id_token; Then lastly
 * it attempts to pass this token to tokensCB if defined or abort as otherwise  The
 * function makes a final promise resolution at its return statement with resolved
 * token and returns an object holding all this fresh content consisting of accessToken
 * , id token both expiry time included plus username
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
 * @description This function initiates an authentication flow using a refresh token
 * and catches any errors that may occur. If the refresh token is invalid it will add
 * it to an array called "invalidateRefreshTokens".
 * 
 * @param {  } err - The err parameter is used to pass any error that might occur
 * during the auth process. In this case it seems to be caught and logged as an invalid
 * refresh token if its present.
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
