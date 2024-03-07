# takes any number of arguments, including integers, ranges, and pairs of integers,
# and prints a message based on the type of input provided.
# 
# @param args [Array] 1-5 inputs passed to the `slice` function, allowing it to
# handle different types of input values and provide appropriate output messages accordingly.
# 
# @returns [Integer] a message indicating the type of input provided.
def slice(*args)
  case args
  in [Integer => index]
    puts "Single integer input. Index: #{index}"
  in [Range => range]
    puts "Range input. Range: #{range}"
  in [Integer => from, Integer => to]
    puts "Two integers input. From: #{from}, To: #{to}"
  end
end

slice(5)                # Output: Single integer input. Index: 5
slice(1..10)            # Output: Range input. Range: 1..10
slice(3, 7)             # Output: Two integers input. From: 3, To: 7
