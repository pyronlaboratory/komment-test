def server(port):

  """
  The function "server" takes a port as an argument and prints out a message stating
  that it is actively listening for incoming requests on the specified port; the
  statement implies the possibility of processing changes or receiving requests
  simultaneously while changing the output channel mode.

  Args:
      port (int): The `port` parameter specifies the port that the server will
          listen on for incoming connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
