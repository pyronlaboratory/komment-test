def fit(self, x_train, y_train, epochs, learning_rate):
  """
  The function implements the training loop of a neural network using backpropagation
  for an epoch. It takes inputs such as x_train and y_train for training the model
  with specified number of epochs and learning rate. During each iteration of the
  loop it calculates the output for each sample of the input and computes the loss
  between predicted output and ground truth. Further backpropagation is applied
  to each layer to update weights of the model. The function also prints the error
  at the end of each epoch.

  Args:
      x_train (str): Passes through each example or sample to produce the next set
          of inputs.
      y_train (list): The `y_train` parameter is passed as true labels during
          training for calculation of the loss between predicted output and true
          output.
      epochs (int): The `epochs` parameter specifies the number of training
          iterations to run.
      learning_rate (float): Here's your response:
          
          UPDATES LAYER WEIGHTS.

  """
  samples = len(x_train)
  for i in range(epochs):
    err = 0
    for j in range(samples):
      output = x_train[j]
      for layer in self.layers:
	output = layer.forward_propagation(output)
	err += self.loss(y_train[j], output)
	error = self.loss_prime(y_train[j], output)
	for layer in reversed(self.layers):
	  error = layer.backward_propagation(error, learning_rate)
	err /= samples
	print("epoch %d/%d   error=%f" % (i + 1, epochs, err))
