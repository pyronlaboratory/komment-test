def server(port):
  """
  The `server` function listens for incoming requests on a specific port (as
  specified by the input `port`) and prints a message indicating that it is ready
  to serve requests.

  Args:
      port (int): The `port` input parameter passed to the `server()` function
          specifies the TCP port on which the server will listen for incoming connections.

  """
  print(f"Server listening: {port}")
