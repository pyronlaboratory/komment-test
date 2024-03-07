class Word
  include Comparable
  attr_reader :text

  # sets the value of the instance variable `@text` to the input argument `text`.
  # 
  # @param text [String] string value that will be stored in the instance variable
  # `@text` within the function `initialize`.
  # 
  # @returns [instance of the `@text` variable, which is assigned the input argument
  # `text`.] the given text assigned to the `@text` instance variable.
  # 
  # 		- `@text`: The initialized text value, which is assigned to the instance variable
  # with the same name `@text`.
  def initialize(text)
    @text = text
  end

  # generates a string representation of an object, including its class and any
  # additional text provided as an argument.
  # 
  # @returns [Class] a string representation of the object, including its class and
  # additional information.
  def inspect
    "#<#{self.class} #{text}>"
  end

  def ==(other)
    other.is_a?(Word) && text == other.text
  end

  def <=>(other)
    text <=> other.text if other.is_a?(Word)
  end

  # checks if a given string consists only of punctuation characters.
  # 
  # @returns [`Boolean`.] a boolean value indicating whether the given text contains
  # only punctuation characters.
  # 
  # 		- `match?`: The method used to check if the input text contains only punctuation
  # characters.
  # 		- `/^[[:punct:]]+$/`: The regular expression used in the `match?` method to match
  # only punctuation characters at the beginning of the input string.
  def punctuation?
    text.match?(/^[[:punct:]]+$/)
  end

  # creates a new `Word` instance from the given `text`, with the characters capitalized.
  # 
  # @returns [Object] a new `Word` object representing the capitalized version of the
  # input text.
  def capitalize
    Word.new(text.capitalize)
  end

  # creates a new `Word` instance by passing the `text` parameter through the `downcase`
  # method, returning the result as a new object.
  # 
  # @returns [Object] a new `Word` object containing the downcased text.
  def downcase
    Word.new(text.downcase)
  end

  # generates a new `Word` object containing the given text in upper case.
  # 
  # @returns [Class] a new `Word` instance representing the uppercased version of the
  # input text.
  def upcase
    Word.new(text.upcase)
  end

  # creates a new `Word` object with the reversed characters of the given `text`.
  # 
  # @returns [`Word`.] a new `Word` object containing the reversed text.
  # 
  # 		- The output is an instance of the `Word` class, which represents a single word
  # in the input text.
  # 		- The `Word` instance has a `text` attribute that contains the reverse of the
  # original word.
  # 		- The `Word` instance has no other attributes or properties.
  def reverse
    Word.new(text.reverse)
  end
end

word1 = Word.new("hello")
word2 = Word.new("world")
word3 = Word.new("!")

puts "word1: #{word1.inspect}"
puts "word2: #{word2.inspect}"
puts "word3: #{word3.inspect}"

puts "word1 == word2: #{word1 == word2}"
puts "word1 == word1: #{word1 == word1}"

puts "word1 < word2: #{word1 < word2}"
puts "word1 > word2: #{word1 > word2}"
puts "word1 <=> word2: #{word1 <=> word2}"

puts "word1.capitalize: #{word1.capitalize.inspect}"
puts "word1.downcase: #{word1.downcase.inspect}"
puts "word1.upcase: #{word1.upcase.inspect}"
puts "word1.reverse: #{word1.reverse.inspect}"

puts "Is '#{word1.text}' a punctuation? #{word1.punctuation?}"
puts "Is '#{word3.text}' a punctuation? #{word3.punctuation?}"
