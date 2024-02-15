def server(port):

  """
  The function "server(port)" prints a message to the console indicating that the
  server is active and listening on a specific port. It also notes that changes
  are being made simultaneously when running output mode on the channel.

  Args:
      port (int): The `port` input parameter is passed to the `print()` function
          and sets the argument for the string literal when defining the server.
          The string printed by `print()` will therefore be suffixed with the value
          of `port`.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
