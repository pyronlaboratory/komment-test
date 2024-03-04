abstract class Motorcycle
{
    public void StartEngine() {/* Method statements here */ }
    protected void AddGas(int gallons) { /* Method statements here */ }
    public virtual int Drive(int miles, int speed) { /* Method statements here */ return 1; }
    public abstract double GetTopSpeed();
}
