def server(port):
  """
  The function "server" accepts a port number as input and prints out a message
  stating that the server is up and running and ready to receive incoming connections
  on the specified port number and is able to accept changes while channel output
  mode changed

  Args:
      port (int): The port input parameter indicates the listening port number
          that the server will use to receive requests; it is a configureable
          parameter allowing different ports to be selected as needed for development
          or deployment scenarios.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed");

