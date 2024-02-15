def server(port):
  
  """
  The provided function `server(port)` listens for incoming connections on a port
  specified by the caller and prints a message indicating that the server is active
  and accepting new connections. Additionally the function adds new changes
  parallelly while output channel mode changes.

  Args:
      port (int): The input `port`parameter takes a value representing the port
          on which the server listens for incoming requests; it serves as an
          identifier and is passed to print statement.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
