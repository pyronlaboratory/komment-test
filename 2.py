def server(port):
  """
  This function "server" takes a single argument "port" and prints a message
  indicating that the server is listening on that port. The message includes
  information about the current mode of the output channel.

  Args:
      port (int): The `port` input parameter is an integer that specifies the TCP
          port on which the server will listen for incoming connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
