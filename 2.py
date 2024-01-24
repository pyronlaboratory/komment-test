def server(port):
  """
  The function "server" takes a port as an argument and prints a message indicating
  that the server is listening on that port. It also mentions that the server will
  continue to accept new changes even when the output channel is switched to
  parallel mode.

  Args:
      port (int): The `port` input parameter is used to specify the port number
          where the server will listen for incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
