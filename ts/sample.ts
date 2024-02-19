import { configure } from "./config.js";
import { TokensFromRefresh } from "./model.js";
import { retrieveTokens, TokensFromStorage } from "./storage.js";
import { initiateAuth } from "./cognito-api.js";
import { setTimeoutWallClock } from "./util.js";

let schedulingRefresh: ReturnType<typeof _scheduleRefresh> | undefined =
  undefined;

/**
 * @description This function allows a `scheduleRefresh` variable to be set to a
 * promise returned by `_scheduleRefresh`, and returns the promise object itself. If
 * `scheduleRefresh` is not already a promise or undefined; then it sets `schedulingRefresh`
 * to that promise and sets `schedulingRefresh` back to `undefined` after it's done.
 * 
 * @param { Parameters } args - The input parameter 'args' takes and passes the
 * parameter(parameters) that would normally be passed to the original scheduleRefresh
 * function for when its invoked with specific values from other code points. Essentially
 * its just there to wrap any data the new 'scheduleRefresh' may need if one chooses
 * to modify _scheduleRefresh at all to better fit a usecase within a codebase/application.
 * 
 * @returns { Promise } The output of the function "scheduleRefresh" is an awaitable
 * value with the type 'Promise<undefined>' The purpose of the function appears to
 * be scheduling a refresh using another function (_scheduleRefresh) which takes
 * parameters...The calling of that refresh is within a 'finally' block where the
 * scheduled refresh flag('schedulingRefresg')is set to undefined. In essence once 
 * that finally blocks is triggered all future scheduling calls will be cancelled  .
 * The first call or schedual  refresh will  trigger and run the internal function
 * before the scheduledRefreshes Flag set to undefinite(null perhaps)? Thus null can
 *   never returned instead 'undefind'. A promise  with the type: 'Promise<void>'
 * could resolve without ever revesing/being rejected
 */
export async function scheduleRefresh(
  ...args: Parameters<typeof _scheduleRefresh>
) {
  if (!schedulingRefresh) {

/**
 * @description The function schedules a refresh by calling a refresh method with an
 * optional set of arguments (...args). It uses the Finally clause to set schedulingRefresh
 * to undefined once the current block has finished.
 */
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
 * @description This function schedules a refresh of "tokens" using an ABORTABLE
 * setTimeout WALL_CLOCK with jitter to minimize multiple requests due to refresh
 * requests arriving simultaneously and returns a clearfunction to cancel the scheduled
 * refresh if it has not yet occured.
 * Additionally. it adds an abort event listener for AbortSignals added before
 * invocation and will also catch and log errors upon completion
 * 
 * @param { boolean } abort,tokensCb,isRefreshingCb - The input parameter abort signals
 * an action to stop whatever operation is happening - i.e., refresh the token., and
 * to prevent further invocations of this function for its life cycle.. TokensCb
 * receives tokens fetched or the value that an error took place with the ability to
 * log the issues; while isRefreshingCb receives information to be able to set the
 * refresh/not-refreshing status somewhere else
 * 
 * @returns { Promise } This function takes object arguments _abort_, _tokensCb_ and
 * an optional function argument _isRefreshingCb_.  If any of these arguments have
 * values then certain parts of the code within this function will execute specific
 * calls backs or return promises of those specific calls. Afterwards there are lines
 * which appear to debug the state of things using what appears to be the Chrome
 * browser developer tools console. Afterwards it is attempting to refresh tokens
 * either by immediate action (no wait time), or waiting some time before acting.
 * When calling the function any and all previous scheduled refreshes  (using
 * _clearScheduledRefresh_) are cleared before making a fresh scheduled refresh.
 * In return the function itself seems to be returning what is being assigned back
 * to an old reference to setTimeOutWithCleanup. This references call may have resolved
 * or be rejected with noisy logging.
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
 * @description This function schedules a timeout using `setTimeout` to call the
 * `refreshTokens` function after a delay specified by `refreshIn`. The `refreshTokens`
 * function is passed an abort signal and several callbacks: `tokensCb`, `isRefreshingCb`,
 * and `tokens`. If the `refreshTokens` function errors out the `debug` variable will
 * be logged to.
 */
    clearScheduledRefresh = setTimeoutWallClock(
      () =>
/**
 * @description This function call 'refreshTokens' with several options. It catches
 * errors with a debugging message. It has three possible functions passed to it -
 * abort which does what it says on the tin but doesn't appear here to be used;
 * tokensCb called when the new access token arrives; isRefreshingCb for displaying
 * refresh state information; and a fourth optional argument called 'tokens' an object
 * that contains currently held and previously held data relevant to refresh. It does
 * NOT return a value after error or completion.
 * 
 * @param {  } err - The `err` parameter is a value that may be provided as an argument
 * when the function does not complete successfully (`catch` block). Therefore the
 * purpose of the `err` parameter is to handle potential errors that might occur
 * during execution.
 */
        refreshTokens({ abort, tokensCb, isRefreshingCb, tokens }).catch(
          (err) => debug?.("Failed to refresh tokens:", err)
        ),
      refreshIn
    );
    abort?.addEventListener("abort", clearScheduledRefresh);
  } else {
/**
 * @description This function calls a promise that tries to refresh a set of tokens
 * with the help of abort signal. Additionally there are callback functions; one which
 * is called when the token is being refreshed another called when an error is thrown
 * from within the function while it's attempting to refresh  the tokens .It then
 * log's and possible errors on the console depending on availability and status of
 * a debug variable
 * 
 * @param { any } err - The `err` parameter provides an error object containing
 * information about an issue that might occur when refreshing tokens. It allows for
 * handling potential errors within the promise's `catch()` block to take specific
 * actions based on failure.
 */
    refreshTokens({ abort, tokensCb, isRefreshingCb, tokens }).catch((err) =>
      debug?.("Failed to refresh tokens:", err)
    );
  }
  return clearScheduledRefresh;
}

let refreshingTokens: ReturnType<typeof _refreshTokens> | undefined = undefined;

/**
 * @description This function wraps the `refreshTokens` function and returns a Promise
 * that resolves to the result of the wrapped function if it is not currently being
 * refreshed (i.e., the `refreshingTokens` variable is not defined).
 * 
 * @param { Parameters } args - Nothing - there is no use of `args` within the body
 * of the function. It's simply a Parameters object that has been explicitly provided
 * as an input parameter but not utilized inside the function itself.
 * 
 * @returns { Promise } This function returns a promise that is either resolved or
 * rejected. If the token refresh is successful (i.e., _refreshTokens() resolves),
 * the promise returned by refreshTokens() is resolved with no value. If the token
 * refresh fails (i.e., _refreshTokens() rejects), the promise returned by refreshTokens()
 * is rejected with an error. Additionally，the function sets refreshingTokens to a
 * promise that resolves/rejects when the token refresh is completed. This promise
 * can be used to check if the token refresh is still ongoing.
 */
export async function refreshTokens(
  ...args: Parameters<typeof _refreshTokens>
) {
  if (!refreshingTokens) {
/**
 * @description This anonymous self-invoking function is a IIFE (Immediately Invoked
 * Function Expression). It refreshes the token if it exists with the arguments given
 * to refreshTokens as function arguments and when execution is complete of the finally
 * block sets 'refreshingToken' to 'undefined'. The overall effect after completion
 * will leave refreshingToken uninitialized or undefined
 */
    refreshingTokens = _refreshTokens(...args).finally(
      () => (refreshingTokens = undefined)
    );
  }
  return refreshingTokens;
}

const invalidRefreshTokens = new Set<string>();

/**
 * @description This async function takes an options object and attempts to refresh
 * tokens using a refresh token and username provided within the configuration object.
 * It then optionally calls the passed-in callback with the newly retrieved tokens.
 * 
 * @param { boolean } abort,tokensCb,isRefreshingCb,tokens - Here is an explanation
 * of the four inputs provided for this function:
 * 
 * 1/ abort : It specifies whether an abort signal was received that causes the
 * operation to terminate. The method throws an error when provided.
 * 2/ tokensCb - A callback for tokens passed as the first and only parameter of
 * refreshed Tokens
 * 3/ isRefreshingCb: Notified function every time refreshTokens are currently running
 * and called with boolean value as a parameter stating if it's currently refreshing
 * or done refreshing. This notified function returns 'unknow.'
 * 4/ tokens: If specified refresh Tokens otherwise they are retrieved using retrieve
 * Tokens method which may take some amount of time for it to return the actual tokens
 * needed. The purpose of having them optional gives flexibility where some developers
 * may have already retrieved the tokenthemselves and decide not to retry getting
 * such a critical variable of data every single call
 * 
 * @returns { Promise } The ` _refreshTokens` function returns a promise that resolves
 * to an object with five properties:
 * 1/ accessToken (an access token)
 * 2/ idToken (an ID token)
 * 3/ expireAt (expiration time as milliseconds from now).
 * 4/ username (username extracted from the tokens.)
 * The output is wrapped inside `TokensFromRefresh`.
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
 * @description This initiates an authentication attempt with the specified refresh
 * token and aborts the promise chain upon failure to authenticate; additionally
 * adding any invalidated tokens for tracking purposes.
 * 
 * @param { object } err - The `err` input parameter is an error object that is passed
 * as the second argument to the callback function provided during the `.catch()`
 * method call. It carries information about any error that occurs during the
 * authentication process and can be used to handle any errors that may arise during
 * the execution of the function.
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
