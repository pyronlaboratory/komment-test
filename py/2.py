def server(port):
  """
  The provided function definition appears to be a Python function named "server"
  that takes a single argument "port". When the function is called with a specific
  port number as an argument and executes the following actions:
  1/ Prints a message to the console indicating that the server is listening on
  that specific port.
  2/ It uses an f-string to print the message "Server listening: {port}" and adds
  some extra text indicating that new changes are being added to the system while
  the output channel mode has been changed.

  Args:
      port (int): The `port` input parameter tells the function on which port the
          server should listen for incoming client connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
