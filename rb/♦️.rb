// @komment write all

class X

   # prints "x:" and then calls two inner functions, `nested_y` and `nested_z`, which
   # also print to the console.
   # 
   # @returns [String] :
   # 
   # "x:"
   # "ha!"
   # "z:"
   def outer_x
      print( "x:" )

      # prints "ha!" to the console.
      # 
      # @returns [String] "ha! ".
      def nested_y
         print("ha! ")
      end

      # prints the value of `z` followed by the contents of `nested_y`.
      # 
      # @returns [String] "z:".
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
