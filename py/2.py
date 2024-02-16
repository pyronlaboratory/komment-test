def server(port):
  """
  This function defines a server that listens for incoming requests on a specific
  port and prints a message indicating that it is running and ready to receive
  requests. The message includes the port number and the fact that new changes are
  being added to the system while the output channel mode is changed.

  Args:
      port (int): The `port` input parameter specifies the port where the server
          listens for incoming connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
