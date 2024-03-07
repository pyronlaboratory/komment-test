class Test
  def initialize(active)
    @active = active
  end

  def invoke = (puts "works" if @active)
end

Test.new(true).invoke
