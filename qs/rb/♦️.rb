class X
   # prints "x:" and then calls two inner functions, `nested_y` and `nested_z`, which
   # print "ha!" and then call `nested_y` again.
   # 
   # @returns [`Expression`.] :
   # 
   # "x: ha! z:"
   # 
   # 		- `x:` - A single line of text printed to the console.
   # 		- `ha!`: - A single line of text printed to the console within the `nested_y` function.
   # 		- `z:` - A single line of text printed to the console within the `nested_z` function.
   # 		- `nested_y` and ` nested_z` - Two functions defined within the `outer_x` function,
   # which print additional lines of text to the console.
   def outer_x
      print( "x:" )
      # prints "ha!" to the console.
      # 
      # @returns [String] "ha! ".
      def nested_y
         print("ha! ")
      end
      # prints the value of `z`.
      # 
      # @returns [Integer] "z: ...".
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
