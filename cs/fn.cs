using System;
namespace GoogleTestAdapter.Common { public static class Functional {public static Func<TArgument, TAnonymousReturnType> ToFunc<TArgument, TAnonymousReturnType>(Func<TArgument, TAnonymousReturnType> lambda)
{return lambda;}}}
