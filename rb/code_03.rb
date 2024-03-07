class Word
  include Comparable
  attr_reader :text

  def initialize(text)
    @text = text
  end

  def inspect
    "#<#{self.class} #{text}>"
  end

  def ==(other)
    other.is_a?(Word) && text == other.text
  end

  def <=>(other)
    text <=> other.text if other.is_a?(Word)
  end

  def punctuation?
    text.match?(/^[[:punct:]]+$/)
  end

  def capitalize
    Word.new(text.capitalize)
  end

  def downcase
    Word.new(text.downcase)
  end

  def upcase
    Word.new(text.upcase)
  end

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
