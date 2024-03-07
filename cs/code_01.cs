public void DoProcessing()
{
    TraceMessage("Something happened.");
}

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
