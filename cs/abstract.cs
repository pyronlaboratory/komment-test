public class A  
{  
    /// <summary> 
    /// takes two integer arguments and returns their sum. 
    /// </summary> 
    /// <param name="a"> 
    /// first number that will be added to `b`. 
    /// </param> 
    /// <param name="b"> 
    /// 2nd number to be added to the result of the function. 
    /// </param> 
    /// <returns> 
    /// the sum of its input parameters. 
    /// </returns> 
    public virtual int Calculate(int a, int b)  
    {  
        return a + b;  
    }  
}

public class B: A  
{  
    /// <summary> 
    /// takes two integer inputs and returns their sum plus 1. 
    /// </summary> 
    /// <param name="a"> 
    /// 1st number being multiplied with the 2nd number. 
    /// </param> 
    /// <param name="b"> 
    /// 2nd number to be added to the result of the calculation, which is initially set 
    /// to `a + 1`. 
    /// </param> 
    /// <returns> 
    /// the sum of `a` and `b`, plus 1. 
    /// </returns> 
    public override int Calculate(int a, int b)  
    {  
        return a + b + 1;  
    }  
}  
