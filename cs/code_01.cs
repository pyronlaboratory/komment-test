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
/// <c>foo</c> creates an anonymous class and assigns an integer value to a field, 
/// then returns a Action object representing a method from that class. 
/// </summary> 
/// <returns> 
/// an instance of the anonymous class `@AnonymousClass001`, with the field `i` set 
/// to 100. 
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
/// <c>TraceMessage</c> writes a message and various contextual information to the 
/// trace log, including the name of the calling member, file path, and line number. 
/// </summary> 
/// <param name="message"> 
/// message to be traced and is written to the Trace output along with additional 
/// information such as the member name, source file path, and source line number. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed to the `Trace.WriteLine()` method for logging. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed to the `Trace.WriteLine()` method for logging. 
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
/// <c>DrawGraph</c> generates a graph based on a given function, by first plotting 
/// the axes and then plotting the function's values at each pixel location using world 
/// coordinates. 
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
