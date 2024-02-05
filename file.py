from fnmatch import fnmatchcase
from typing import cast

from asgiref.typing import (
    ASGI3Application,
    ASGIReceiveCallable,
    ASGISendCallable,
    ASGISendEvent,
    HTTPResponseBodyEvent,
    HTTPResponseStartEvent,
    HTTPScope,
    Scope,
)
from django.conf import settings


def cors_handler(application: ASGI3Application) -> ASGI3Application:
    """
    The given function is a CORS handler that wraps another ASGI application and
    handles CORS preflight requests. It determines the origin of the request and
    adds appropriate CORS headers if the origin is allowed.

    Args:
        application (ASGI3Application): The `application` input parameter is passed
            to the `await application(scope ...)` line of code inside the `if
            scope["method"] == "OPTIONS":` block. Here it is used as a callback
            function which will be called with the same `Scope` and `ASGIReceiveCallable`
            object used to call this handler. The return value of this callback
            function will then be passed as the response body and end the response
            cycle.

    Returns:
        ASGI3Application: The output of this function is an ASGI receiver function
        that handles CORS prefllight requests.

    """
    async def cors_wrapper(
        scope: Scope, receive: ASGIReceiveCallable, send: ASGISendCallable
    ) -> None:
        # handle CORS preflight requests
        """
        The function cors_wrapper wraps an ASGI application with CORS handling for
        preflight requests. It determines the origin of the request and adds
        appropriate CORS headers if the origin is allowed. If the origin is not
        allowed it responds with a 400 error. The function takes three arguments:
        scope which contains information about the request such as the headers and
        the method , receive which is called with each message received from the
        application and send which sends a response event back to the client

        Args:
            scope (Scope): The `scope` input parameter of the function contains
                information about the incoming request such as request method
                request headers and the body and specifies which ASGI application
                should be called to handle the request.
            receive (ASGIReceiveCallable): The `receive` parameter is passed to
                the `send` function whenever an HTTP request is received. It takes
                an ASGI Receive Event and passes it along to the handler function
                to be processed.
            send (ASGISendCallable): The `send` parameter is an ASGI coroutine
                that receives events of type `http.response.*`, and is called once
                for each event. It is used to send a response to the client. In
                this function specifically `send` is used to set headers based on
                Origin Header received during options method and vary header sent
                by the server to make further API calls to origin domain work successfully

        """
        if scope["type"] != "http":
            await application(scope, receive, send)
            return
        # determine the origin of the request
        request_origin: str = ""
        for header, value in scope.get("headers", []):
            if header == b"origin":
                request_origin = value.decode("latin1")
        # if the origin is allowed, add the appropriate CORS headers
        origin_match = False
        if request_origin:
            for allowed_origin in settings.ALLOWED_GRAPHQL_ORIGINS:
                if fnmatchcase(request_origin, allowed_origin):
                    origin_match = True
                    break
        if scope["method"] == "OPTIONS":
            scope = cast(HTTPScope, scope)
            response_headers: list[tuple[bytes, bytes]] = [
                (b"access-control-allow-credentials", b"true"),
                (
                    b"access-control-allow-headers",
                    b"Origin, Content-Type, Accept, Authorization, "
                    b"Authorization-Bearer",
                ),
                (b"access-control-allow-methods", b"POST, OPTIONS"),
                (b"access-control-max-age", b"600"),
                (b"vary", b"Origin"),
            ]
            if origin_match:
                response_headers.append(
                    (
                        b"access-control-allow-origin",
                        request_origin.encode("latin1"),
                    )
                )
            await send(
                HTTPResponseStartEvent(
                    type="http.response.start",
                    status=200 if origin_match else 400,
                    headers=sorted(response_headers),
                    trailers=False,
                )
            )
            await send(
                HTTPResponseBodyEvent(
                    type="http.response.body", body=b"", more_body=False
                )
            )
        else:

            async def send_with_origin(message: ASGISendEvent) -> None:
                """
                Sends a modified HTTP response event with headers that include
                "access-control-allow-credentials", "access-control-allow-origin"
                and "vary". The origin match is checked and the vary header is
                updated accordingly.

                Args:
                    message (ASGISendEvent): The `message` input parameter is
                        passed to the function and its type is `ASGISendEvent`.

                """
                if message["type"] == "http.response.start":
                    response_headers = [
                        (key, value)
                        for key, value in message["headers"]
                        if key.lower()
                        not in {
                            b"access-control-allow-credentials",
                            b"access-control-allow-origin",
                            b"vary",
                        }
                    ]
                    response_headers.append(
                        (b"access-control-allow-credentials", b"true")
                    )
                    vary_header = next(
                        (
                            value
                            for key, value in message["headers"]
                            if key.lower() == b"vary"
                        ),
                        b"",
                    )
                    if origin_match:
                        response_headers.append(
                            (
                                b"access-control-allow-origin",
                                request_origin.encode("latin1"),
                            )
                        )
                        if b"Origin" not in vary_header:
                            if vary_header:
                                vary_header += b", Origin"
                            else:
                                vary_header = b"Origin"
                    if vary_header:
                        response_headers.append((b"vary", vary_header))
                    message["headers"] = sorted(response_headers)
                await send(message)

            await application(scope, receive, send_with_origin)

    return cors_wrapper
