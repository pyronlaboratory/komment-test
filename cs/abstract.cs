public class A  
{  
    public virtual int Calculate(int a, int b)  
    {  
        return a + b;  
    }  
}  
public class B: A  
{  
    public override int Calculate(int a, int b)  
    {  
        return a + b + 1;  
    }  
}  
