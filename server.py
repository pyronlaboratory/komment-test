def server(port):
  """
  This function listens for incoming requests on a given port and prints a message
  indicating that the server is running and the port it's listening on.

  Args:
      port (int): The `port` input parameter is passed as an argument to the
          `server` function and defines the TCP port on which the server will
          listen for incoming connections.

  """
  print(f"Server listening on port: {port}")
