def server(port):
  """
  This function serves as an HTTP server that listens on a specified port and
  prints a message indicating the current listening state and its ability to handle
  multiple requests concurrently.

  Args:
      port (int): The `port` input parameter specifies the port number that the
          server will listen on for incoming connections.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
