abstract class Motorcycle
{
    /// <summary> 
    /// sets the engine state to "started". 
    /// </summary> 
    public void StartEngine() {/* Method statements here */ }
    /// <summary> 
    /// adds a specified number of gallons to a storage tank. 
    /// </summary> 
    /// <param name="gallons"> 
    /// amount of gas to be added to the vehicle's tank. 
    /// </param> 
    protected void AddGas(int gallons) { /* Method statements here */ }
    /// <summary> 
    /// takes two input parameters: `miles` and `speed`. It returns an integer value 
    /// representing the number of miles driven. 
    /// </summary> 
    /// <param name="miles"> 
    /// distance to be traveled by the vehicle in the `Drive()` function. 
    /// </param> 
    /// <param name="speed"> 
    /// speed at which the vehicle is traveling during the drive, and it is used to calculate 
    /// the distance traveled based on the `miles` input parameter. 
    /// </param> 
    /// <returns> 
    /// 1/ 
    /// </returns> 
    public virtual int Drive(int miles, int speed) { /* Method statements here */ return 1; }
    public abstract double GetTopSpeed();
}


public Point Move(int dx, int dy) => new Point(x + dx, y + dy);
public void Print() => Console.WriteLine(First + " " + Last);
// Works with operators, properties, and indexers too.
public static Complex operator +(Complex a, Complex b) => a.Add(b);
public string Name => First + " " + Last;
public Customer this[long id] => store.LookupCustomer(id);


using System;
namespace GoogleTestAdapter.Common { public static class Functional {public static Func<TArgument, TAnonymousReturnType> ToFunc<TArgument, TAnonymousReturnType>(Func<TArgument, TAnonymousReturnType> lambda)
{return lambda;}}}

