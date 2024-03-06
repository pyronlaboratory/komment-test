System.Linq.Expressions.Expression<Func<int, int>> e = x => x * x;

using System;
using System.Linq.Expressions;

class Program
{
    /// <summary> 
    /// defines an expression `e` that maps any integer `x` to its square `x*x`. 
    /// </summary> 
    static void Main()
    {
        Expression<Func<int, int>> e = x => x * x;
    }
}

