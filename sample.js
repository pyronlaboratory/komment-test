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
