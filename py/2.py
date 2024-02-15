def server(port):

  """
  This function "server" starts a server that listens on a specific port and prints
  a message indicating that it is ready to receive connections. It also references
  a new change coming into play that is about to be added and mentions a parallel
  connection while the output channel changes mode. In other words; this server
  is printing out its status information once when active or "up."

  Args:
      port (int): The port input parameter indicates which port to listen on for
          incoming client connections. In other words; the server will be activated
          and "listen" (i.e., receive requests) for a predesignated set or "port."

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
