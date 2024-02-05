class Network:
	def __init__(self):
		"""
		Initializes an instance of the class by initializing an empty list of layers and
		setting loss and loss_prime to None.

		"""
		self.layers = []
		self.loss = None
		self.loss_prime = None

	# add layer to network
	def add(self, layer):
		"""
		The function adds a layer to the end of the list of layers contained by the object.

		Args:
		    layer (): The layer input parameter is appended to the self.layers list.

		"""
		self.layers.append(layer)

	# set loss to use
	def use(self, loss, loss_prime):
		"""
		Accepts two arguments: 'loss' and 'loss_prime' as instance variables called
		'self.loss' and 'self.loss_prime'.

		Args:
		    loss (): The `loss` input parameter assigns the value of the loss to the
		        instance variable `self.loss`.
		    loss_prime (float): The `loss_prime` input parameter sets the primary loss
		        value for the `use()` method.

		"""
		self.loss = loss
		self.loss_prime = loss_prime

	# predict output for given input
	def predict(self, input_data):
		# sample dimension first
		"""
		Here is the answer to your question.
		This function takes an input object 'input_data' and then proceeds to:
		1/) Extract sample size information.
		2/) Iterate through the input samples by index 'i'.
		3/) Perform Forward Propagation on the current input for all layers using
		respective layer objects 'layer.'
		4/) Save resulting output as part of a larger list called 'result'.
		5/) Return entirety of list 'result'

		Args:
		    input_data (): Here is a response to that. It directly and precisely answers
		        your questions by using the guidelines that you have given it. Your
		        comments are included at the bottom of my answer for reference as you requested:
		        
		        Define the predict function.
		        • What does the input_data parameter do?
		             This function has a single input argument called "input_data" with
		        no return type. The parameter input_data of type Any will be used to
		        create a list called result that will consist of values having the
		        identical type as input_data. A brief explanation follows: Forward
		        propagation on all provided examples will use each component (e.g.,
		        weights) once for each instance to calculate its outcome and return an
		        array of NumPy arrays with shape sample_size X number_of_neurons [3].
		        When it is completed using a for loop over all input samples i through
		        range(samples), we call this result-building technique running the network
		        over all examples.
		        
		        References:

		Returns:
		    dict: The output returned by the given function is a list of outputs. Each
		    output represents the activation values for all layers after running the
		    forward propagation starting from the input data and progressing through all
		    the layers of the network.

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
		This function fits a neural network on the given training data for a specified
		number of epochs using the given learning rate. It computes the average error
		on all samples after each epoch and prints it.

		Args:
		    x_train (float): X-train serves as input to the model for training purpose
		        and passes through all its layers for forward propagation
		    y_train (float): Here is the answer to your question:
		        
		        The `y_train` input parameter passes the correct output for a given input
		        x.
		    epochs (int): Here's the answer you requested:
		        
		        epochs controls the number of iterations to perform during training.
		    learning_rate (float): The `learning_rate` parameter is used to control the
		        step size of each gradient descent update.

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
