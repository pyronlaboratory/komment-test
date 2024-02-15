def server(port):

  """
  The function 'server' takes one argument 'port', and when called upon to do so
  prints out the following line to the terminal with f-string format : "Server
  listening: [PORT_VALUE] | adding new changes n parallel while output channel
  mode changed"

  Args:
      port (int): The port input parameter is passed as an argument when calling
          the function and defines which port number should be used for listening
          for incoming network connections. In this context the value passed to
          port becomes the binding address of the server for that specific call
          of the function

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
