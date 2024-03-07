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
/// <c>Main</c> calls `foo()` to generate some value and then passes it as an argument 
/// to `bar()`. 
/// </summary> 
void Main()
{
  var a = foo();
  bar(a);
}

/// <summary> 
/// <c>foo</c> creates a new instance of an anonymous class, assigns the value of `i` 
/// to a field within that class, and then returns the result of calling an instance 
/// method on that class. 
/// </summary> 
/// <returns> 
/// an `Action` instance that references the result of calling the `AnonymousMethod001` 
/// method on an anonymous class instance. 
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
/// <c>bar</c> calls the provided `Action` object's `act()` method, passing it no arguments. 
/// </summary> 
/// <param name="a"> 
/// action to be performed and is invoked by calling the corresponding method. 
/// </param> 
public void bar(Action a)
{
  a();
}

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

/// <summary> 
/// <c>DoProcessing</c> tracesthe message "Something happened." 
/// </summary> 
public void DoProcessing()
{
    TraceMessage("Something happened.");
}

/// <summary> 
/// <c>TraceMessage</c> logs a message, member name, source file path and line number 
/// to the trace log. 
/// </summary> 
/// <param name="message"> 
/// message to be traced and is passed as a string into the `Trace.WriteLine` methods 
/// to log it in the trace output. 
/// </param> 
/// <param name="string"> 
/// message to be traced. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is written to the Trace output. 
/// </param> 
/// <param name="int"> 
/// 0-based line number of the source file where the called member was defined. 
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
/// <c>DrawGraph</c> generates high-quality documentation for code given to it by 
/// plotting a function on a graph using world coordinates and Anti-Alias smoothing mode. 
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
