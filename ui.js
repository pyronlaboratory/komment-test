/**
 * @description () => {...}.
 * This anonymous self-invoking function takes one argument of type undefined. The
 * expression => means this is an arrow function which we won't discuss now. The event
 * handler adds an event listener for the event "play".
 * As the code inside event listeners are run when their corresponding event occurs.
 * Therefore at some point during playback this function will be called on some
 * undefined video element (likely a media element like <video>).
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
