def server(port):
  """
  The provided function `server(port)` prints a message indicating that the server
  is listening on port `port`, and mentions "adding new changes" and "output channel
  mode changed", suggesting that the server is able to handle multiple requests
  concurrently and has the ability to update its functionality while running.

  Args:
      port (list): The `port` input parameter specifies on which port number the
          server will be listening for incoming connections. It allows the function
          to be called with a different port number each time it is invoked.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
