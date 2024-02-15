def server(port):
  """
  This function defines a server that listens on a specified port and prints a
  message indicating that it is listening and ready to receive incoming requests.

  Args:
      port (int): The port parameter determines on which port number the function
          will listen for incoming requests and responses. Therefore it functions
          as an index to select which communication socket should receive the
          request or response.

  """
  print(f"Server listening: {port} | adding new changes in parallel while output channel mode changed")
