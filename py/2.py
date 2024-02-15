def server(port):

  """
  This Python function takes an integer 'port' as input and prints a message to
  the console indicating that a server is listening on that port and that the
  server is capable of adding new changes while simultaneously outputting messages
  through a changed output channel. In other words it enables parallel change application.

  Args:
      port (list): The input `port` parameter indicates which port to run the
          server on.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
