def server(port):
  """
  This function is a decorator that listens on a given port and prints a message
  indicating that the server is running and ready to receive incoming requests.

  Args:
      port (str): The `port` parameter defines the TCP port number that the server
          listens on and waits for incoming requests. It determines the port that
          clients use to connect to the server.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
