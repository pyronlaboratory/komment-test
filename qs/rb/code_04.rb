class Test
  # sets the `@active` instance variable to the provided `active` argument.
  # 
  # @param active [`Boolean`.] state of the object, setting it to `true` if it is
  # active and `false` otherwise when the function is called.
  # 
  # 		- `@active`: A boolean attribute that represents the activity state of the object.
  # It takes on the value of `active` passed to the function as its argument.
  # 
  # 
  # @returns [Module] an instance variable `@active` that stores the input parameter
  # `active`.
  def initialize(active)
    @active = active
  end

  def invoke = (puts "works" if @active)
end

Test.new(true).invoke
