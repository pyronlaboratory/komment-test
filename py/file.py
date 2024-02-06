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
    This function is a CORS handler that processes preflight requests and sets the
    appropriate headers for allowed origins. It determines the origin of the request
    and checks if it's among the allowed origins; if so ,it adds the CORS headers
    to the response and allows the application to proceed with processing the request.

    Args:
        application (ASGI3Application): The `application` parameter is the ASGI
            application to wrap with CORS handling. The wrapped application is
            passed to the CORS handler as an argument and receives the `Scope`,
            `Receive`, and `Send` events from the CORS handler.

    Returns:
        ASGI3Application: The function cors_handler takes an application and returns
        a new ASGI application that handles CORS preflight requests. Here's a
        concise explanation of what the function does:
        
        1/ Determines the origin of the request from the headers.
        2/ Checks if the origin is allowed by checking against a list of allowed
        origins.
        3/ Adds appropriate CORS headers to the response if the origin matches an
        allowed origin.
        4/ Forwardes the request to the application and returns the response.

    """
    async def cors_wrapper(
        scope: Scope, receive: ASGIReceiveCallable, send: ASGISendCallable
    ) -> None:
        # handle CORS preflight requests
        """
        This function takes a scope and an ASGI receive and send callable as
        arguments and serves CORS preflight responses for graphql requests that
        originate from other domains than the allowed ones

        Args:
            scope (Scope): The `scope` input parameter provides information about
                the incoming request. It includes headers and other metadata related
                to the request. The function uses some of this information -
                specifically the 'Origin' header- to determine whether the request
                should be handled with CORS. If the Origin header is present and
                matches one of the allowed origins set up admin configuration ,
                then appropriate CORS heads are added to the response . otherwise
                tjje request  is not processed with  CORS.
            receive (ASGIReceiveCallable): The `receive` parameter is called for
                every incoming request event to the ASGI application. It takes an
                `ASGIRecieveEvent` object and returns a promise that resolves with
                a modified event or void. The `async def cors_wrapper` function
                captures and modifies the incoming event to handle CORS requests.
                The receive input's return promise resolves with the original event
                passed through the handler or a new `HTTPResponseStartEvent` to
                start an HTTP response with modifications as part of handling CORS
                preflight requests
            send (ASGISendCallable): The `send` parameter is an ASGI SendCallable.
                It is passed the events emitted by the ASGI application and sends
                them on to the next hop.

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
                Sets headers for sending a response based on the given event
                ASGISendEvent object's message header data to enable access control.
                  Origin matching based on request_origin variable allows specific
                response header adding as vary parameter to specify headers that
                must be presented again

                Args:
                    message (ASGISendEvent): The `message` parameter is an
                        `ASGISendEvent` object that contains information about the
                        HTTP request. The function modifies this object by adding
                        or modifying headers and then sends it on to the next component.

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
