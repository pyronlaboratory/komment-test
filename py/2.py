def server(port):
  """
  The given code defines a function `server` that takes a single argument `port`,
  and prints a message indicating that the server is listening on that port.
  Additionally it states "new changes" are being added to the system "in parallel",
  while the output channel mode has changed. In other words the function servers
  as a notification that the system is ready to receive input and make changes accordingly

  Args:
      port (int): The input `port` is passed to the built-in server module's
          create_server method and specifies the port on which the server will
          listen for incoming requests. This value of the function argument serves
          as a connection endpoint.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed");

