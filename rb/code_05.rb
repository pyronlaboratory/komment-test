def slice(*) = case [*]
in [Integer => index]
  p(index:)
in [Range => range]
  p(range:)
in [Integer => from, Integer => to]
  p(from:, to:)
end
