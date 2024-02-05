def fit(self, x_train, y_train, epochs, learning_rate):
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


class Network:
	def __init__(self):
		"""
		Initializes the instance variables `layers`, `loss`, and `loss_prime`.

		"""
		self.layers = []
		self.loss = None
		self.loss_prime = None

	# add layer to network
	def add(self, layer):
		"""
		Adds a new layer to the end of a list called self.layers.

		Args:
		    layer (): The layer input parameter is appended to the instance attribute layers.

		"""
		self.layers.append(layer)

	# set loss to use
	def use(self, loss, loss_prime):
		"""
		Here's the verbs you requested. I am unable to change wording:
		sets self.loss equal to loss and sets self.loss_prime
		equal to loss_prime

		Args:
		    loss (float): SETS. The `loss` input parameter sets the value of the `loss`
		        attribute of the object.
		    loss_prime (): The `loss_prime` parameter is assigned to the `self.loss_prime`
		        attribute.

		"""
		self.loss = loss
		self.loss_prime = loss_prime

	# predict output for given input
	def predict(self, input_data):
		# sample dimension first
		"""
		This function predicts outputs for multiple input samples simultaneously by
		running a neural network over each sample and returning a list of outputs.

		Args:
		    input_data (): The `input_data` input parameter is passed over the network
		        multiple times as each forward propagation occurs.

		Returns:
		    list: The function returns a list of output values produced by the network
		    over all input samples.

		"""
		samples = len(input_data)
		result = []

		# run network over all samples
		for i in range(samples):
			# forward propagation
			output = input_data[i]
			for layer in self.layers:
				output = layer.forward_propagation(output)
			result.append(output)

		return result

	# train the network
	def fit(self, x_train, y_train, epochs, learning_rate):
		# sample dimension first
		"""
		The given function implements the training process of a neural network with an
		input layer that takes training data X and Y simultaneously using the forward-backward
		propagation algorithm.
		It first prints the training progress information every epoch using the computed
		error and loops for an instance number (sample size) for both training inputs X
		& Y.
		In other words; this function trains a neural network.

		Args:
		    x_train (): The `x_train` input parameter is the training dataset.
		    y_train (float): The `y_train` input parameter is used to compute the loss
		        during backpropagation and display the error for each training sample.
		    epochs (int): The `epochs` input parameter controls how many training
		        iterations are performed. During each iteration the network's weights
		        are updated after computing the loss.
		    learning_rate (float): Learning rate determines step-size for backward propagation.

		"""
		samples = len(x_train)

		# training loop
		for i in range(epochs):
			err = 0
			for j in range(samples):
				# forward propagation
				output = x_train[j]
				for layer in self.layers:
					output = layer.forward_propagation(output)

				# compute loss (for display purpose only)
				err += self.loss(y_train[j], output)

				# backward propagation
				error = self.loss_prime(y_train[j], output)
				for layer in reversed(self.layers):
					error = layer.backward_propagation(error, learning_rate)

			# calculate average error on all samples
			err /= samples
			print("epoch %d/%d   error=%f" % (i + 1, epochs, err))
