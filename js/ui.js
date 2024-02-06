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


/**
 * @description OK.
 * 
 * This JavaScript function captures the display dimensions of a video player and
 * resizes them according to its height and width so they may be matched against each
 * frame after matching every face expression with tiny face detection options. When
 * detected using expression draw methods including landmarks on drawn detections
 * within a two-dimensional canvas as background for this method then starts intervals
 * that allow the redrawing after each second of the play event from which faces have
 * been found upon calling detectAllFaces  with face-detect functionality so all
 * subsequent redrawn can happen at the displayed speed without delay while expressions
 * still change rapidly during the capture video event of audio play where matching
 * faces landmarks are required for later processing.
 */
function Video(){
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
