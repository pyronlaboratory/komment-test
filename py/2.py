def server(port):
  """
  The function "server" takes a single argument "port" and prints a message
  indicating that the server is listening on that port and is able to handle changes
  concurrently while the output channel's mode is altered.

  Args:
      port (int): The `port` parameter sets the port number where the server will
          listen for incoming client connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
