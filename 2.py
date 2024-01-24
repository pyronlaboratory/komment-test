def server(port):
  """
  This function defines a server that listens on a given port (input) and prints
  a message indicating that it is ready to accept connections. It also mentions
  that the server will be adding new changes "in parallel" and that the output
  channel mode has been changed.

  Args:
      port (int): The `port` input parameter specifies the port number where the
          server will listen for incoming connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
