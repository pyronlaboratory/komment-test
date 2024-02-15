def server(port):

  """
  This function defines a Python Server that listens for incoming requests on a
  specified port and prints a message indicating that the server is listening and
  ready to receive requests. The message includes the port number and a mention
  of parallel changes.

  Args:
      port (int): The `port` parameter tells the server which port to bind to for
          accepting connections; the `print()` statement uses this port number
          within the message displayed to the user.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
