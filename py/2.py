def server(port):
  """
  The provided function definition defines a function named `server` that takes a
  single argument `port`, and prints a message to the console indicating that the
  server is listening on that port. The message includes information about the
  port and the fact that new changes are being added to the system while the output
  channel mode is changed.

  Args:
      port (int): The `port` input parameter tells the server what port to listen
          on for incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
