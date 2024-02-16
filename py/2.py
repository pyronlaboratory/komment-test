def server(port):
  """
  This function prints a message to the console indicating that a server is listening
  on a specific port and ready to receive new changes while handling multiple tasks
  simultaneously.

  Args:
      port (int): The port input parameter determines which port the server listens
          to for incoming requests; the function will print a message indicating
          that the server is running and ready to accept connections on the specified
          port.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
