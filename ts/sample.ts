import { configure } from "./config.js";
import { TokensFromRefresh } from "./model.js";
import { retrieveTokens, TokensFromStorage } from "./storage.js";
import { initiateAuth } from "./cognito-api.js";
import { setTimeoutWallClock } from "./util.js";


let schedulingRefresh: ReturnType<typeof _scheduleRefresh> | undefined =
  undefined;

/**
 * @description This function allows for scheduling a refresh of an unspecified
 * function asynchronously. It initially saves the schedule request to an unknown
 * variable called "schedulingRefresh," ensuring that no further attempts at scheduling
 * another refresh are made; then if a previous refresh has not been requested and
 * completed via _scheduleRefresh ()(), it issues a call for _scheduleRefresh(()),
 * which completes once it does a final () method. If an asynchronous request has
 * begun prior to returning schedulingRefresh back to undefined before further refresh
 * scheduling begins again.
 * 
 * @param { Parameters } args - The `args` input parameter is not used or processed
 * by the scheduleRefresh function body since there is no reference to it inside the
 * functions' implementation body and there are no apparent logical usage places for
 * such a parameter inside the implementations that are invoked recursively with
 * parameters as a parameter; accordingly the `args` parameter can be ignored when
 * calling the function since the original purpose of its implementation has been
 * refactored/encapsulated/changed via refactoring by the author or previous maintainer.
 * 
 * @returns { object } The function `scheduleRefresh` accepts any number of arguments
 * passed to it. If the variable `schedulingRefresh` doesn't have a value previously
 * assigned to it (i.e., `schedulingRefresh === undefined`), this function first calls
 * the _scheduleRefresh function (omitted from the provided snippet). This call is
 * "wrapped" by the finally block at the end of this scheduleRefresh function. Therefore
 * as soon as the function returned the value/resolves or the promise of whatever was
 * passed to _scheduleRefresh method (omitted),  the `schedulingRefresh` variable
 * will immediately change to undefined again regardless of the promise state so it
 * goes back to null.
 * If there already was a previous call where scheduleRefresh made such a request for
 * whatever reason (a non-empty `schedulingRefresh`), that would have completed as
 * before the current request (in either a success or rejection manner) regardless
 * and this next request's return promise has not completed until AFTER all these
 * have run; then they resolve together once its completed or rejection if that were
 * to occur at any time; therefore it waits for whatever previously made calls and
 * their returns before moving onward; however returning the previous results of any
 * prior successful call is a nice side effect without alteration or concatenation
 * (like making the finally clause after a series of await chained promisses which
 * would wait only once at then return them immediately with all).
 * Because finally can never throw a promise does not abort subsequent scheduled
 * refreshes for some sort of exception as those refreshes are independent so if one
 * schedules many and several fail that will not stop later scheduling requests for
 * this mechanism from moving forward successfully until either every one completes
 * (like the success path), or one or all rejection status would return through any
 * chained await to handle exceptions respectively before continuing with fresh
 * attempts for upcoming schedules
 * Thus this implementation enables both reliably maintaining multiple async call
 * chain refresh scheduling for completing their calls but does so gracefully cancel
 * each start without interfering other subsequent scheduled requests once they've
 * started(completed) rather than waiting idly until promise all/reject fully for
 * those after failed chained or await chain before rescheduling if necessary which
 * could add unnesesary latency with high concurrency especially where those calls
 * may require network access
 * Finally because the first scheduled start of a chain doesn't block future start
 * of next immediate successive scheduling (e.g., one every few minutes/sec regardless).
 * This gives control to when schedules get queued and how many simultaneously
 * outstanding with proper synchronization via underlying event sources
 * A light refresh function then that could take parameters safely and wait for last
 * successful or throw some promise to resolve while allowing graceful immediate
 * cancellation of succeeding attempts; good for cancel refreshing other similar
 * processes for the given interval for a duration of the main process
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
 * @description This function schedules a token refresh at some time before expiry
 * based on current expiry date and jitter for spacing out simultaneous requests then
 * attempts to refresh tokens when it is scheduled to with optional abort signal and
 * optional callbacks for completion (or error). It returns an object to clear the
 * schedule later.
 * 
 * @param { boolean } abort,tokensCb,isRefreshingCb - The function parameters `abort`,
 * `tokensCb`, and `isRefreshingCb` all act as callback functions or aborter objects
 * with the ability to abort or receive information about the token refresh process.
 * Here is a quick run down of each:
 * 
 * - `abort`: Aborts the current scheduled refresh by setting an abort signal when called.
 * 
 * - `tokensCb`: The tokens that should be received as part of this callback; they
 * have no defaults because if there were no token value they would throw errors that
 * were not nice to deal with on this end.
 * 
 * - `isRefreshingCb`: a function provided callback allowing you to tell whether the
 * token has already begun refreshing or has finished; its type does not enforce
 * providing it but can only be fulfilled if a function of sort is provided because
 * an unknown 'isRefreshing' property is given (you could throw errors depending on
 * your business needs).
 * 
 * @returns { Promise } This function schedules a token refresh at some point within
 * 30 seconds before the expiry of current tokens. If no refresh is scheduled already
 * and all required conditions are met - including an acceptable difference between
 * the scheduled date/time versus the existing date/time on the client's computer or
 * device and enough time remains to perform the task and handle the requested call
 * back(s) after initiating token refreshing- then it sets up an alert with a function
 * named `setTimeoutWallClock()`; it returns value returned from that. If this function
 * were run repeatedly when more than one client is using the code it may provide
 * somewhat spread-out token refreshes as an implementation to help reduce stress on
 * service resources and improve page loading/interaction times - or if clients need
 * promptly up-to-date info this will at most cause extra delay(s) of just under one
 * second (which can likely go undetected unless multiple calls were performed very
 * rapidly and back-to-back as opposed to minutes/hours/days apart; this slight time
 * padding would generally prevent overloads). The value returned by the timeout
 * varies between values at near - half a second to twice that value due to use of
 * an adjusted difference subtracted off for its resolution rather than just accepting
 * whole seconds or precise results with an otherwise simple check for the time between
 * then and refresh vs today (not hours ahead...); otherwise it would waste time by
 * alerting more rapidly as there was usually nothing new gained from each check. It
 * calls `abort?.addEventListener()` for extra protection on how abort requests would
 * cancel and prevent further calls or handling needed upon token request cancellation
 * by outside/caller services.
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
 * @description This function schedules a token refresh using the `setTimeoutWallClock()`
 * method after the specified time (`refreshIn`) has passed. The refresh operation
 * is performed using the `refreshTokens()` function and any errors are caught and
 * logged with the `debug()` function.
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
 * @description This function takes arguments and repeatedly attempts to refresh the
 * provided token until a success response is returned from the backend; only allowing
 * one refresh attempt to occur at a time by initializing the "refreshingTokens" value
 * before calling _refreshTokens function
 * with any provided parameters. The value of "refreshingTokens" gets assigned
 * 'undefined' after execution or after it has successfully received a token response.
 * When calling this refresh tokens function with any arguments provided to its
 * execution those multiple argument calls only return one result from each refresh
 * and will only attempt that one call if refreshingTokens is set to true which
 * cancellation prevents any future refreshing from occurring while setting the
 * previous to undefined.
 * 
 * @param { Parameters } args - The input parameter `args` is used as a variadic
 * parameters to pass multiple arguments to the wrapped function `_refreshTokens`.
 * It is not used or evaluated within the refreshTokens function.
 * 
 * @returns { Promise } Based on the code snippet provided:
 * 
 * The output of the function refreshTokens is "refreshingTokens". If refreshingTokens
 * is already defined (i.e., a previous refreshToken request is still ongoing), then
 * the function will return that previous promise and not make another request.
 * Otherwise the function makes a new request using _refreshTokens and returns a new
 * promise that resolves to "refreshingTokens". After the promise resolved or rejected
 * this variable is set to undefined so that the next call will know if there's already
 * an ongoing request or not
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
 * @description This function calls the retrieveTokens function if tokens have no
 * values and will also update invalid refresh token hash to prevent multiple times
 * request with failure tokens and after successfully retrieving or checking and
 * validating all input refresh tokens  it initiates and asynchronous authentication
 * attempt with a specified set of Auth Parameters  passing auth flow and abort
 * signals; Once success fully retrieved tokens , this function saves refreshToken
 * to be used as username
 * 
 * @param { object } abort,tokensCb,isRefreshingCb,tokens - This functions takes four
 * parameters:
 * 
 * 1/ `abort`: An abort signal to cancel the operation
 * 2/ `tokensCb`: A callback function called after obtaining new tokens.
 * 3/ `isRefreshingCb`: A callback to tell if an refresh is ongoing
 * 4/ `tokens`: Initial tokens for refresh or empty (if undefined).
 * 
 * @returns { Promise } This function takes options and uses them to initiate an
 * authentication flow to retrieve tokens and refresh any expired ones using a refresh
 * token; the function outputs an object with AccessToken Id Token expiration date
 * (converted to milliseconds since 1970), and a username:
 * The returned output will include:
 * 
 * 	- accesstoken - An access token generated after a successful authentication flow
 * 	- idtoken - an Idtoken
 * 	- username  -  Username obtained during login
 * 	- expireat   - An Expiration date converted from miliseconds elapsed since 1970
 * for Access token and Id token
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
 * @description This initiates an authentication flow using a refresh token and checks
 * if the refresh token is valid. If it's not valid it adds the token to an invalid
 * list and throws an error with the input refresh token.
 * 
 * @param {  } err - Here is the definition of `initiateAuth()` and a list of its
 * input parameters:
 * 
 * public initiateAuth({ authflow: AuthFlowEnum; authParameters: ParametersTo
 * authenticate<AuthResult>; }, (err): void): Promise <AuthResult>
 * 
 * The purpose of the parameter `(err)` is to capture and handle any error that may
 * occur during the authentication process. The `err` parameter is optional. If an
 * error occurs during initialization of auth., it can be captured and thrown with
 * the function or handled inside the promise resolved by calling the catch block .
 * When initiatingAuth returns a promise instead of void ,the function would typically
 * expect and err as part of that return to reflect failure state  of initialization
 * flow. Typically initia Auth functions don't pass value to this parameter but only
 * to observe potential error values for future use and loggin purpose
 * 
 * In simple terms `(err)` allows the function `initiateAuth()` to return an error
 * if the authentication failed. The parameter is mostly used for logging or alerting
 * purposes
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
