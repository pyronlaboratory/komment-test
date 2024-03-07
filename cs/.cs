public class PropertyUtil  
{  
    /// <summary> 
    /// <c>DoSomething</c> performs an action or set of actions. 
    /// </summary> 
    public void DoSomething()  
    {  
        // Do Something.  
    }  
    /// <summary> 
    /// <c>DoSomethingElse</c> calls the `DoSomething` instance method, allowing for the 
    /// execution of additional code. 
    /// </summary> 
    public void DoSomethingElse()  
    {  
        this.DoSomething(); // Calling to instance method.  
    }  
}  
public class Program  
{  
    /// <summary> 
    /// <c>Main</c> calls an instance method named `DoSomething()` of a class named `PropertyUtil`. 
    /// </summary> 
    static void Main()  
    {  
        PropertyUtil util = new PropertyUtil();  
        util.DoSomething(); // Calling to instance method.  
    }  
}
