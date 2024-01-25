def server(port):
  """
  The function "server" takes a port number as an argument and prints a message
  indicating that the server is listening on that port. It also mentions that the
  server will be adding new changes to the system while the output channel mode
  is changed. In other words，the function starts a server on the specified port
  and indicates that it will be running concurrently with the addition of new
  changes to the system.

  Args:
      port (int): The `port` input parameter specifies the port number that the
          server should listen on for incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
