System.Linq.Expressions.Expression<Func<int, int>> e = x => x * x;

using System;
using System.Linq.Expressions;

class Program
{
    static void Main()
    {
        Expression<Func<int, int>> e = x => x * x;
    }
}

