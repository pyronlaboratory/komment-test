void empty()
{
  ;  // Perfectly legal
}

public void Foo() => Expression.Empty();

Func<int, int, int> f = (x, y) => x + y;
