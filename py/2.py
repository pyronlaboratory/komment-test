def server(port):
  
  """
  This function defines a Python server that listens for incoming requests on a
  specific port and prints a message indicating that it is ready to receive
  connections. The message includes the port number and mentions that the server
  will add new changes while its output channel mode is changed.

  Args:
      port (int): The input parameter `port` specifies on which port the server
          should listen for incoming requests. It is used to identify the specific
          port number that the server should use for listening and receiving
          incoming requests.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
