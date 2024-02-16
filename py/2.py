def server(port):
  """
  The provided Python function `server` takes a port as input and prints a message
  indicating that the server is running and accepting incoming connections on that
  port. The message includes a hint about the ability to add new changes while the
  output channel mode is changed.
  In other words: the function simply announces that the server is up and ready
  to receive requests on a specific port.

  Args:
      port (str): The input parameter "port" tells the server what port number to
          run on; it's used for identification.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed");

