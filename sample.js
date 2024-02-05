/**
* @description This function fetches the top posts from a Reddit community specified
* by the `sub` parameter. It uses Axios to make a GET request to the JSON endpoint
* of the chosen subreddit and logs any errors or responses to the console.
* 
* @param { string } sub - The `sub` input parameter is a substring that gets appended
* to the endpoint URL of the Axios GET request. In this case `/r/$`. This allows the
* function to retrieve data from different subreddits by providing a different value
* for the `sub` parameter each time.
* 
* @returns { Promise } The function fetch(sub = "programming") makes a GET request
* to the Reddit API for the specified subreddit (e.g., r/programming). If there is
* no error with the request or processing of the response data (as represented by a
* console.log call), the resultant value will be the full JSON data received from
* the API; otherwise null is returned due to a consol-logged exception/error condition
* within the .catch clause of an associated promise created from the axios instance
* call
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
* @description This function is a recursive search function that searches for the
* element 'x' within an array 'arr' starting from index 'start' up to 'end'. It
* returns 'true' if the element is found and 'false' otherwise.
* 
* @param { array } arr - The `arr` input parameter is the array to be searched.
* 
* @param { array } x - The `x` input parameter is the value to be searched for within
* the array `arr`. It is used as a reference point to compare elements of the array
* and return `true` when the value is found or `false` when it is not.
* 
* @param { number } start - The `start` parameter specifies the beginning index of
* the range to be searched.
* 
* @param { number } end - The `end` input parameter specifies the index after which
* to search for the element. The function recursively divides the search range into
* two parts based on whether the mid-indexed element is greater or less than the
* target element. `end` determines the last index to consider during this division.
* 
* @returns { boolean } This function takes an array `arr`, a search value `x`, and
* three integers `start`, `end`, and `mid`. It performs a linear search on the given
* interval of the array `arr` to find if the value `x` exists or not.
* 
* The output returned by this function is `true` if the value `x` is found within
* the specified range and `false` otherwise. The function performs a recursive
* divide-and-conquer approach to find the target element. If the search range has
* only one element (i.e., `start == end`), then the function directly checks if the
* element at index `mid` matches the `x`, and if it does it returns `true`. If not
* found at mid-index point it will recursively calls itself with `arr`, `x`, `start`,
* and `mid - 1`. or `mid + 1` until either finding a matching element or until `start`
* equals to `end` meaning no match was found.
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
* @description This function is an AWS Lambda function that handles requests for
* FIDO2 authentication-related APIs. It extracts the user handle and other information
* from the incoming request context and uses that information to perform the relevant
* actions:
* 
* 1/ Registering a new authenticator ( handling "register-authenticator/start" and
* "complete" paths).
* 2/ Listing all authenticators for a user (handling "authenticators/list" path).
* 3/ Deleting an authenticator (handling "authenticators/delete" path).
* 4/ Updating the display name of an authenticator (handling "authenticators/update"
* path).
* 5/ Returning 404 if requested path is not recognized.
* 
* In essence ,the function processes FIDO2 authentication-related API calls and
* performs appropriate actions based on the requested operation and user handle.
* 
* @param { Component } event - The `event` input parameter is an AWS Lambda event
* object that contains information about the current request. It includes details
* such as the path parameters (e.g., `fido2path`), query string parameters (e.g.,
* `rpId`), and the user-provided body (if present). The event object is used throughout
* the function to access these values and determine how to handle the request.
* 
* @returns { object } This function handles HTTP requests and returns responses
* related to authenticator registrations and listings for a specific user. The output
* returned by this function can be described as follows:
* 
* 1/ When a request is made to register an authenticator with the Cognito User Pool
* service ("register-authenticator/start"), the function throws an error if no name
* or display name is provided. Otherwise it starts the registration process and
* returns the options for doing so.
* 2/ Upon successful completion of the registration process ("register-authenticator/complete"),
* the function stores the credential information and returns the details of the new
* authenticator.
* 3/ If a list of existing authenticators is requested for the user ("authenticators/list"),
* the function checks if the Relying Party ID is valid before returning a list of
* existing authenticators for that user and RPID.
* 4/ To delete an authenticator credential of the specified Cognito User Pool user
* ("authenticators/delete") or to update it ("authenticators/update"), the function
* performs those operations accordingly and returns successful status responses
* indicating no content with a 204 or 200 HTTP response code.
* 
* Any non-HTTP 20X response will imply that there is a user-facing error for reasons
* specified via status messages where necessary to help the end-user understand what
* might be wrong with their request.
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
