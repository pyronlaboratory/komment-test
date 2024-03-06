class X
   # prints "x:" and then calls itself twice, printing "ha!" after each call.
   # 
   # @returns ["x:".] :
   # 
   # "x:" followed by "ha!" and then "z:" with the inner `nested_y` function called twice.
   # 
   # 		- `print( "x:" )`: This statement is executed when the `outer_x` function is
   # called, and it outputs the string "x:".
   # 		- `def nested_y`: This statement defines a new function named `nested_y`.
   # 		- `print("ha! ")`: This statement outputs the string "ha! ".
   # 		- `def nested_z`: This statement defines a new function named `nested_z`.
   # 		- `print( "z:" )`: This statement outputs the string "z:".
   # 		- `nested_y`: This is a function that is called within the `outer_x` function.
   # Its definition is nested inside the `outer_x` function.
   # 		- `nested_z`: This is another function that is called within the `outer_x`
   # function. Its definition is also nested inside the `outer_x` function.
   def outer_x
      print( "x:" )
      # prints "ha!" .
      # 
      # @returns [String] "ha!".
      def nested_y
         print("ha! ")
      end
      # prints "z:" and then executes the `nested_y` function recursively.
      # 
      # @returns [Integer] "z: null".
      def nested_z
         print( "z:" )
         nested_y
      end
      nested_y
      nested_z
   end
end

ob = X.new
ob.outer_x         #=> x:ha! z:ha!
