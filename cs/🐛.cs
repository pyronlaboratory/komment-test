using System;

class Program
{
    /// <summary> 
    /// does nothing and does not modify any external state or variables. 
    /// </summary> 
    static void empty()
    {
      ;
    }

    /// <summary> 
    /// empties its expression. 
    /// </summary> 
    void Foo() => Expression.Empty();

    Func<int, int, int> f = (x, y) => x + y;

    /// <summary> 
    /// divides two input numbers and displays the result to the console. 
    /// </summary> 
    /// <param name="args"> 
    /// 0 or more command-line arguments passed to the program when it is launched. 
    /// </param> 
    static void Main(string[] args)
    {
        int num1 = 10;
        int num2 = 0;
        
        int result = Divide(num1, num2);
        
        Console.WriteLine("The result is: " + result);
    }
    
    /// <summary> 
    /// takes two integers as input, divides the first by the second and returns the result. 
    /// </summary> 
    /// <param name="dividend"> 
    /// number being divided. 
    /// </param> 
    /// <param name="divisor"> 
    /// number being divided. 
    /// </param> 
    /// <returns> 
    /// the result of dividing the `dividend` and `divisor` integers. 
    /// </returns> 
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
    
    /// <summary> 
    /// prints "Inside SomeOtherFunction" to the console and attempts to assign the value 
    /// "Hello" to an integer variable, resulting in a compile error due to the incorrect 
    /// data type assignment. 
    /// </summary> 
    static void SomeOtherFunction()
    {
        Console.WriteLine("Inside SomeOtherFunction");
        // Uncommenting this line will cause an error
        int x = "Hello";
    }
}

