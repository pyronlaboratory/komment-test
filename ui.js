/**
 * @description Creates a new timer list with the given msecs and unrefed status. The
 * created timer is wrapped with TimerWrap and added to the list. If unrefed is true
 * the timer is unreferenced.
 * 
 * @param { number } msecs - Start. The `msecs` input parameter passes the time
 * measured with milliseconds into the constructor and allows it to be used later for
 * start().
 * 
 * @param { boolean } unrefed - Based on the given information unrefed is a Boolean
 * parameter which is an optional input argument. It when set to true theTimerWrap
 * instance that is returned is "unreffed"
 */
function TimersList(msecs, unrefed) {
  this._idleNext = this; // Create the list with the linkedlist properties to
  this._idlePrev = this; // prevent any unnecessary hidden class changes.
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
 * @description Adds an event listener to a 'play' event of an invisible
 * video element. The function creates a FaceAPI canvas from the media element and
 * appends it to the body. Next it determines the display size of the video before
 * using FaceAPI to detect faces and expressions. Finally it sets an interval to run
 * those face and expression detections every 100 milliseconds.
 */
const ui = () => {
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
