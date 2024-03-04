namespace PM  
{  
    partial class A  
    {  
        partial void OnSomethingHappened(string s);  
    }  
    partial class A  
    {  
        partial void OnSomethingHappened(String s)  
        {  
            Console.WriteLine("Something happened: {0}", s);  
        }  
    }  
}  
