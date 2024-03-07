class Test
  # sets the instance variable `@active` to the provided `active` parameter, ensuring
  # it is properly initialized for further use within the code.
  # 
  # @param active [`Boolean`.] boolean value that controls whether the function performs
  # its intended operation, with `true` indicating activation and `false` indicating
  # deactivation.
  # 
  # 		- `@active`: A boolean attribute that represents whether the object is active
  # or not.
  # 
  # 
  # @returns [`@active` variable, which is assigned the input argument `active`.] the
  # value of `@active`, which is set to the input argument `active`.
  # 
  # 	@active: This attribute holds the value passed to the initialize function, which
  # is an instance of `Boolean`. It represents whether the object is active or not.
  def initialize(active)
    @active = active
  end

  def invoke = (puts "works" if @active)
end

Test.new(true).invoke
