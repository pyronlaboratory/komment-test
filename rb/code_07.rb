class Overruler
    def [] (input)
          if input.instance_of?(String)
            puts "string"
          else
            puts "not string"
          end
     end
end
foo = Overruler.new
foo["bar"].inspect
foo[1].inspect
