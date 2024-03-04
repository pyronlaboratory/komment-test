public class PropertyUtil  
{  
    public void DoSomething()  
    {  
        // Do Something.  
    }  
    public void DoSomethingElse()  
    {  
        this.DoSomething(); // Calling to instance method.  
    }  
}  
public class Program  
{  
    static void Main()  
    {  
        PropertyUtil util = new PropertyUtil();  
        util.DoSomething(); // Calling to instance method.  
    }  
