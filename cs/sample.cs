abstract class Motorcycle
{
    public void StartEngine() {/* Method statements here */ }
    protected void AddGas(int gallons) { /* Method statements here */ }
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

