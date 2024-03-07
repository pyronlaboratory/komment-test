class Word
  include Comparable
  attr_reader :text

  # sets a variable called `@text` to the input argument passed to it, which is a
  # string of text.
  # 
  # @param text [String]
  # 
  # @returns [String] the initial value of the `@text` instance variable, which is set
  # to the input `text` parameter.
  def initialize(text)
    @text = text
  end

  # generates documentation for given code by returning a string representation of the
  # class and method name, along with any additional information.
  # 
  # @returns [String] an object representation in the form of `#<ClassName Text>`.
  def inspect
    "#<#{self.class} #{text}>"
  end

  def ==(other)
    other.is_a?(Word) && text == other.text
  end

  def <=>(other)
    text <=> other.text if other.is_a?(Word)
  end

  # matches if the input string consists only of punctuation characters.
  # 
  # @returns [boolean value.] a boolean indicating whether the given string contains
  # only punctuation characters.
  # 
  # 	The function checks whether the given text contains only punctuation characters
  # (e.g., letters with diacritical marks excluded).
  # 
  # 	The function returns `true` if the input text consists solely of punctuation
  # characters, and `false` otherwise.
  def punctuation?
    text.match?(/^[[:punct:]]+$/)
  end

  # creates a new `Word` object by capitalizing the given `text`.
  # 
  # @returns [Object] a new `Word` object containing the capitalized text.
  def capitalize
    Word.new(text.capitalize)
  end

  # creates a new `Word` instance from the given `text` parameter in lowercase.
  # 
  # @returns [instance of `Word`.] a new `Word` object with the downcased text.
  # 
  # 		- `Word.new(text.downcase)`: The output is an instance of the `Word` class, which
  # represents a single word in the input text. The `downcase` method is applied to
  # the original text, resulting in a new word object with lowercase letters.
  def downcase
    Word.new(text.downcase)
  end

  # creates a new `Word` instance by capitalizing the given text string.
  # 
  # @returns [Class] a new `Word` object containing the uppercased text.
  def upcase
    Word.new(text.upcase)
  end

  # creates a new `Word` object from the reversed characters of the input `text`.
  # 
  # @returns [Object] a new `Word` object representing the reversed text.
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
