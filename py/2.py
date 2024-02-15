def server(port):
  """
  This function takes a port as an argument and then simply prints out a message
  that states "Server listening: (port number) and mentions something about parallel
  changes and output channel modes. It doesn't perform any actual networking or
  serve anything; it merely sends out the stated message.

  Args:
      port (int): The port parameter tells the server to listen on that specific
          port number when it starts up and to indicate what port it's listening
          on through the function's return message which is printed out via
          concatenation using an f-string within parentheses 🐢.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
