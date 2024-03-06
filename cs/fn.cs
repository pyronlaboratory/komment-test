// using System;
// namespace GoogleTestAdapter.Common { public static class Functional {public static Func<TArgument, TAnonymousReturnType> ToFunc<TArgument, TAnonymousReturnType>(Func<TArgument, TAnonymousReturnType> lambda)
// {return lambda;}}}

using System;namespace GoogleTestAdapter.Common{public static class Functional{public static Func<TArgument, TAnonymousReturnType> ToFunc<TArgument, TAnonymousReturnType>(Func<TArgument, TAnonymousReturnType> lambda){return lambda;}}class Program{static void Main(string[] args){Func<int, int> square = x => x * x;Func<int, int> cube = x => x * x * x;Func<int, int> squareFunc = Functional.ToFunc(square);Func<int, int> cubeFunc = Functional.ToFunc(cube);Console.WriteLine("Square of 5: " + squareFunc(5));Console.WriteLine("Cube of 3: " + cubeFunc(3));}}}

