public static IEnumerable<T> Sample<T>(this IEnumerable<T> sequence, int frequency,
    [CallerArgumentExpression(nameof(sequence))] string? message = null)
{
    if (sequence.Count() < frequency)
        throw new ArgumentException($"Expression doesn't have enough elements: {message}", nameof(sequence));
    int i = 0;
    foreach (T item in sequence)
    {
        if (i++ % frequency == 0)
            yield return item;
    }
}

class @AnonymousClass001
{
    internal int i;
    /// <summary> 
    /// <c>@AnonymousMethod001</c> writes the value `i` to the console. 
    /// </summary> 
    internal void @AnonymousMethod001()
    {
        Console.Write($"{i}");
    }
}
/// <summary> 
/// <c>Main</c> calls the `foo()` function and passes its return value to the `bar()` 
/// function. 
/// </summary> 
void Main()
{
    var a = foo();
    bar(a);
}

/// <summary> 
/// <c>foo</c> creates an anonymous class, assigns the value of `i` to a property `i` 
/// in that class, and then returns the result of calling the `AnonymousMethod001` 
/// method on that class. 
/// </summary> 
/// <returns> 
/// an instance of the `Action` type with an initialized value of `i`. 
/// </returns> 
public Action foo()
{
    int i = 100;
    var r = new @AnonymousClass001();
    r.i = i;
    Action a = r.AnonymousMethod001;
    return a;
}
/// <summary> 
/// <c>bar</c> executes the provided action, `a`. 
/// </summary> 
/// <param name="a"> 
/// action to be performed by the `bar` function and its execution is initiated by 
/// calling the function followed by invoking the `a()` method. 
/// </param> 
public void bar(Action a)
{
    a();
}

/// <summary> 
/// <c>DoProcessing</c> writes "Something happened" to the system log. 
/// </summary> 
public void DoProcessing()
{
    TraceMessage("Something happened.");
}

/// <summary> 
/// <c>TraceMessage</c> logs messages to the trace writer with specified parameters. 
/// </summary> 
/// <param name="message"> 
/// message to be traced, which is written to the output stream of the Trace class 
/// using the Trace.WriteLine method. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is written to the Trace output followed by a space and 
/// then the message. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed to the `Trace.WriteLine` method for output. 
/// </param> 
/// <param name="int"> 
/// 0-based line number of the source code file where the called method was executed. 
/// </param> 
public void TraceMessage(string message,
        [CallerMemberName] string memberName = "",
        [CallerFilePath] string sourceFilePath = "",
        [CallerLineNumber] int sourceLineNumber = 0)
{
    Trace.WriteLine("message: " + message);
    Trace.WriteLine("member name: " + memberName);
    Trace.WriteLine("source file path: " + sourceFilePath);
    Trace.WriteLine("source line number: " + sourceLineNumber);
}

/// <summary> 
/// <c>DrawGraph</c> takes a rectangle representing the graph's coordinates and plots 
/// the function using a pen. 
/// </summary> 
private void DrawGraph()
{
    const float wxmin = -2;
    const float wxmax = 2;
    const float wymin = -2;
    const float wymax = 2;

    int wid = picGraph.ClientSize.Width;
    int hgt = picGraph.ClientSize.Height;
    Bitmap bm = new Bitmap(wid, hgt);
    using (Graphics gr = Graphics.FromImage(bm))
    {
        gr.SmoothingMode = SmoothingMode.AntiAlias;

        RectangleF rect = new RectangleF(
            wxmin, wymin, (wxmax - wxmin), (wymax - wymin));
        PointF[] points =
        {
            new PointF(0, hgt),
            new PointF(wid, hgt),
            new PointF(0, 0),
        };
        gr.Transform = new Matrix(rect, points);
        Matrix inverse = gr.Transform;
        inverse.Invert();

        // Draw the axes.
        using (Pen pen = new Pen(Color.Red, 0))
        {
            gr.DrawLine(pen, wxmin, 0, wxmax, 0);
            gr.DrawLine(pen, 0, wymin, 0, wymax);
        }

        // Plot the function.
        // Convert X coordinates for each pixel into world coordinates.
        PointF[] values = new PointF[wid];
        for (int i = 0; i < wid; i++) values[i].X = i;
        inverse.TransformPoints(values);

        // Generate Y values.
        for (int i = 0; i < wid; i++)
            values[i].Y = F(values[i].X, A, B);

        // Plot.
        using (Pen pen = new Pen(Color.Black, 0))
        {
            gr.DrawLines(pen, values);
        }
    }

    picGraph.Image = bm;
}
