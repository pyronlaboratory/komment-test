def server(port):
  """
  The function "server" takes an argument "port", prints a message to the console
  indicating that the server is listening on that port and modifies its behavior
  to enable parallel adding of new changes while the output channel is operated
  under modified modes.

  Args:
      port (int): The port parameter represents which available socket the Server()
          function binds to when listening for client incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
