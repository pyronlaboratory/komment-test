/**
* @description This function fetches the top posts from the specified subreddit
* (based on the `sub` parameter) using the `axios` library and logs the response to
* the console. It returns either the full Reddit post data or null if there was an
* error.
* 
* @param { string } sub - In this function `sub`, the input parameter is a subreddit
* name that is used to construct the URL for the API request. It is passed as a
* parameter inside the braces `https://www.reddit.com/r/${sub}.json` and will be
* replaced with the actual value of `sub`.
* 
* @returns { Promise } The function fetch() retrieves the top 25 posts from the
* specified subreddit (default is "programming") using the Axios library to make an
* HTTP GET request to the corresponding Reddit API endpoint. The output returned by
* the function is either:
* 
* 1/ A Response object containing the list of posts if the API call succeeds.
* 2/ null if there was an error while making the API call (i.e., if the promise
* returned by Axios rejects).
* 
* In both cases (success or failure), the response data is logged to the console
* using console.log().
*/
function fetch(sub = "programming") {
  const axios = require("axios");

  axios
    .get(`https://www.reddit.com/r/\${sub}.json`)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}

/**
* @description This function performs a binary search on an array 'arr' to find the
* index of an element 'x'. It returns true if 'x' is found and false otherwise.
* 
* @param { array } arr - The `arr` input parameter is the array to be searched. It
* is not used here at all.
* 
* @param { number } x - In the function `search`, the `x` parameter is the value to
* be searched within the array.
* 
* @param { number } start - The `start` input parameter is the beginning index of
* the range that the function searches for `x`.
* 
* @param { number } end - The `end` parameter represents the end of the array and
* is used to determine the highest index at which the search should continue. It
* sets a boundary for the search range.
* 
* @returns { boolean } This function is a recursive binary search algorithm that
* takes an array and three parameters: `x`, `start`, and `end`. It returns `true`
* if `x` is found between `start` and `end`, or `false` if it's not.
* 
* The function first checks if `start` is greater than `end`, and returns `false`
* if so. Then it calculates the midpoint of the range `start` to `end`, and checks
* if `x` equals that midpoint. If they do match:
* return `true`.
* If `x` is less than the midpoint:
* call itself with the array `arr`, `x`, `start`, and `mid - 1`.
* else
* call itself with the array `arr`, `x`, `mid + 1`, and `end`.
* 
* It will repeatedly narrow down the search range by calling itself on either half
* of the original range until it finds the desired value or determines that it's not
* present.
*/
const search = (arr, x, start, end) => {
  if (start > end) return false;
  let mid = Math.floor((start + end) / 2);
  if (arr[mid] === x) return true;
  if (arr[mid] > x) {
    return search(arr, x, start, mid - 1);
  } else {
    return search(arr, x, mid + 1, end);
  }
};

/**
* @description This AWS Lambda function implements a RESTful API for FIDO2 authentication
* using Amazon Cognito User Pool. It handles various events and path parameters
* related to authenticators and registers new authenticators.
* 
* @param { object } event - The `event` input parameter is an object that contains
* information about the current request or event. It includes details such as the
* requested URL path and parameters.
* 
* @returns { object } This function handles four different HTTP requests related to
* managing authenticators for a user:
* 
* 1/ `register-authenticator/start`: Starting the registration process for a new authenticator.
* 2/ `register-authenticator/complete`: Completing the registration process for a
* new authenticator with stored credentials.
* 3/ `authenticators/list`: Listing all authenticators associated with a user.
* 4/ `authenticators/delete` and `authenticators/update`: Deleting or updating an
* existing authenticator.
* 
* The function returns one of the following outputs depending on the requested HTTP
* method and path parameter:
* 
* 1/ 200 OK (and headers) when the request is successful (e.g., returning a list of
* authenticators).
* 2/ 404 Not Found when the requested resource cannot be found (e.g., an invalid RP
* ID or user handle).
* 3/ 500 Internal Server Error when there's an error processing the request (e.g.,
* due to an unexpected claim value).
* 4/ 400 Bad Request when the request contains invalid or missing required fields
* (e.g., missing an `rpId`).
* 
* The function takes into consideration different scenarios and logics related to
* validating incoming requests before handling them further and returns a appropriate
* output based on those scenarios and logic handled within this function
*/
const handler = async (event) => {
  try {
    const {
      sub,
      email,
      phone_number: phoneNumber,
      name,
      "cognito:username": cognitoUsername,
    } = event.requestContext.authorizer.jwt.claims;
    const userHandle = determineUserHandle({ sub, cognitoUsername });
    const userName = email ?? phoneNumber ?? name ?? cognitoUsername;
    const displayName = name ?? email;
    if (event.pathParameters.fido2path === "register-authenticator/start") {
      logger.info("Starting a new authenticator registration ...");
      if (!userName) {
        throw new Error("Unable to determine name for user");
      }
      if (!displayName) {
        throw new Error("Unable to determine display name for user");
      }
      const rpId = event.queryStringParameters?.rpId;
      if (!rpId) {
        throw new UserFacingError("Missing RP ID");
      }
      if (!allowedRelyingPartyIds.includes(rpId)) {
        throw new UserFacingError("Unrecognized RP ID");
      }
      const options = await requestCredentialsChallenge({
        userId: userHandle,
        name: userName,
        displayName,
        rpId,
      });
      logger.debug("Options:", JSON.stringify(options));
      return {
        statusCode: 200,
        body: JSON.stringify(options),
        headers,
      };
    } else if (
      event.pathParameters.fido2path === "register-authenticator/complete"
    ) {
      logger.info("Completing the new authenticator registration ...");
      const storedCredential = await handleCredentialsResponse(
        userHandle,
        parseBody(event)
      );
      return {
        statusCode: 200,
        body: JSON.stringify(storedCredential),
        headers,
      };
    } else if (event.pathParameters.fido2path === "authenticators/list") {
      logger.info("Listing authenticators ...");
      const rpId = event.queryStringParameters?.rpId;
      if (!rpId) {
        throw new UserFacingError("Missing RP ID");
      }
      if (!allowedRelyingPartyIds.includes(rpId)) {
        throw new UserFacingError("Unrecognized RP ID");
      }
      const authenticators = await getExistingCredentialsForUser({
        userId: userHandle,
        rpId,
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          authenticators,
        }),
        headers,
      };
    } else if (event.pathParameters.fido2path === "authenticators/delete") {
      logger.info("Deleting authenticator ...");
      const parsed = parseBody(event);
      assertBodyIsObject(parsed);
      logger.debug("CredentialId:", parsed.credentialId);
      await deleteCredential({
        userId: userHandle,
        credentialId: parsed.credentialId,
      });
      return { statusCode: 204 };
    } else if (event.pathParameters.fido2path === "authenticators/update") {
      const parsed = parseBody(event);
      assertBodyIsObject(parsed);
      await updateCredential({
        userId: userHandle,
        credentialId: parsed.credentialId,
        friendlyName: parsed.friendlyName,
      });
      return { statusCode: 200, headers };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Not found" }),
      headers,
    };
  } catch (err) {
    logger.error(err);
    if (err instanceof UserFacingError)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
        headers,
      };
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
      headers,
    };
  }
};
