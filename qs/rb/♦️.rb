class X
   def outer_x
      print( "x:" )
      def nested_y
         print("ha! ")
      end
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
