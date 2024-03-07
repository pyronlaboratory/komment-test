class @AnonymousClass001
{
  internal int i;
  /// <summary> 
  /// <c>@AnonymousMethod001</c> writes the value of `i` to the console. 
  /// </summary> 
  internal void @AnonymousMethod001()
  {
    Console.Write($"{i}");
  }
}
/// <summary> 
/// <c>Main</c> calls the `foo()` function and passes its result to the `bar()` function. 
/// </summary> 
void Main()
{
  var a = foo();
  bar(a);
}
/// <summary> 
/// <c>foo</c> creates an instance of an anonymous class, sets a field on it, and then 
/// calls an method on that object to return an action. 
/// </summary> 
/// <returns> 
/// an instance of the `AnonymousClass001` class with an initial value of `i` set to 
/// `100`. 
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
/// <c>bar</c> performs the action passed as its argument, which is executed immediately 
/// after invocation. 
/// </summary> 
/// <param name="a"> 
/// action to be executed in the `bar()` function, and its value is passed as an 
/// argument to the corresponding method or block of code. 
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
/// <c>DoProcessing</c> outputs the message "Something happened." 
/// </summary> 
public void DoProcessing()
{
    TraceMessage("Something happened.");
}

/// <summary> 
/// <c>TraceMessage</c> writes a message and additional information about its origin 
/// to the trace log. 
/// </summary> 
/// <param name="message"> 
/// message to be traced and is passed to the `Trace.WriteLine()` method to log it. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed into the `Trace.WriteLine()` method for logging. 
/// </param> 
/// <param name="string"> 
/// message to be traced and is passed into the `Trace.WriteLine()` method for output. 
/// </param> 
/// <param name="int"> 
/// 0-based line number of the source file where the call to `TraceMessage` occurred. 
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
/// <c>DrawGraph</c> generates a graph of a given function using the pixels of an image 
/// as the x and y coordinates. It plots the function by converting the x-coordinates 
/// into world coordinates, generating y values for each x coordinate using the function, 
/// and plotting the points using lines. 
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
