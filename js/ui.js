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
 * @description Here is the function signature:
 * 
 * The function takes no arguments and returns nothing; its execution scope contains
 * two objects (detections and canvas). With event listeners included that execute
 * asynchronous tasks after waiting for the end of the specified media type video
 * playback. When the "play" media event finishes playing on an instance of the HTML5
 * Media Element named video , a new canvas object will be dynamically appended to
 * the HTML element of body inside the display and dimensions (that equal those of
 * the source video )
 *       face landmarks expressions . Once for the tinyface detections without
 * constraints of network latency are computed on that media content video instance
 * to determine all human faces existing simultaneously as possible; and if existences
 * are found and their resizable sizes including new dimension expressions that also
 * include information such as x & y coordinates on screen at pixel accurate resolution
 * matching canvas size which was defined with its parent dimensions - this new list
 * of these detection s are then drawn onto that freshly appended display canvas with
 * drawing function from tiny-Face
 *         drawing these detection(s) resized will clear first existing face-related
 * markup data . Whenever all possible simultaneously found facial landmark information
 * ( including
 *             left pupil ,  right pupil , left eyebrow arch position/orientation etc
 * ... are expressed for human facial  faces - when they become present. The resulting
 * detection marker data (pixel size / density accurate for its resized dimensions)
 * would then be written on display . Then drawn/overlaid ontop the last resized
 * canvas image which was sized based off parent canvas object bounding rect limits
 * relative towards parent body (a containing HTML divElement perhaps with style
 * boundaries of 1080P/ full hd) for a natural image format rendering process
 * 
 * Can I clarify any of the functionality within Vid function ?
 */
function Vid(){
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
