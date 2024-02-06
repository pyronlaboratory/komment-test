/**
 * @description Creates a new linked list for TimersList and sets the timer's properties
 * such as nextTick and unrefed.
 * 
 * @param { number } msecs - Starts the timer.
 * 
 * @param { boolean } unrefed - Based on the value provided for "unrefed", the input
 * parameter "unrefed" enables or disables the timer's ability to automatically re-run
 * when it is set up using the method "start." The parameter unrefed that has a value
 * of true causes the TimerWrap to refrain from rescheduling on subsequent timer tick
 * iterations; if set to false(default), no such restrictions are placed on how
 * frequently and consistently it may reset and run.
 */
function TimersList(msecs, unrefed) {
  this._idleNext = this;
  this._idlePrev = this;
  this._unrefed = unrefed;
  this.msecs = msecs;
  this.nextTick = false;

  const timer = this._timer = new TimerWrap();
  timer._list = this;

  if (unrefed === true)
    timer.unref();
  timer.start(msecs);
}


() => {
  video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
  });
};
