def server(port):
  """
  This function announces that it is starting to listen for incoming requests on
  a specific port and also indicates that it will be making changes to the program
  "in parallel" (meaning simultaneously) while the program's output channel is
  switched to a different mode.

  Args:
      port (list): The `port` input parameter defines the port where the server
          will listen for incoming requests. In other words , it specifies the
          endpoint of the communication channel through which clients will communicate
          with the server.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed");

