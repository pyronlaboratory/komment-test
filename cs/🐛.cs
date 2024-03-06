void empty()
{
  ;
}

void Foo() => Expression.Empty();

Func<int, int, int> f = (x, y) => x + y;

using System;

class Program
{
    static void Main(string[] args)
    {
        int num1 = 10;
        int num2 = 0;
        
        int result = Divide(num1, num2);
        
        Console.WriteLine("The result is: " + result);
    }
    
    static int Divide(int dividend, int divisor)
    {
        if (divisor == 0)
        {
            Console.WriteLine("Error: Cannot divide by zero");
            return 0;
        }
        else
        {
            return dividend / divisor;
        }
    }
    
    static void SomeOtherFunction()
    {
        Console.WriteLine("Inside SomeOtherFunction");
        // Uncommenting this line will cause an error
        int x = "Hello";
    }
}

