class @AnonymousClass001
{
  internal int i;
  internal void @AnonymousMethod001()
  {
    Console.Write($"{i}");
  }
}
void Main()
{
  var a = foo();
  bar(a);
}
/// <summary> 
/// <c>foo</c> creates an instance of an anonymous class, sets an integer variable `i` 
/// to 100, and then returns the result of calling an instance method on that anonymous 
/// class. 
/// </summary> 
/// <returns> 
/// an instance of type `Action`. 
/// </returns> 
public Action foo()
{
  int i = 100;
  var r = new @AnonymousClass001();
  r.i = i;
  Action a = r.AnonymousMethod001;
  return a;
}
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

public void DoProcessing()
{
    TraceMessage("Something happened.");
}

/// <summary> 
/// <c>TraceMessage</c> logs information to the trace log. It takes a message string 
/// and additional metadata (member name, file path, and line number) from the caller 
/// as arguments. 
/// </summary> 
/// <param name="message"> 
/// message that is being traced and is passed as a string to the `Trace.WriteLine()` 
/// method for logging purposes. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed directly to the `Trace.WriteLine()` method for 
/// logging. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed directly to the `Trace.WriteLine()` method for 
/// logging. 
/// </param> 
/// <param name="int"> 
/// 0-based line number of the source code file where the `TraceMessage` method was called. 
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
/// <c>DrawGraph</c> creates a graph by plotting a given function using pixels. It 
/// first calculates the world coordinates for each pixel and then plots the function 
/// at those points using lines. 
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
