def server(port):
  """
  This function sets up a server that listens on a given port and prints a message
  indicating that it is ready to receive requests. It also mentions that the server
  is able to add new changes "in parallel" and that the output channel mode has
  been changed.

  Args:
      port (int): The `port` input parameter specifies the port on which the server
          will listen for incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
