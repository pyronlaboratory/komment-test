/**
 * @description No problem. Here is your response:
 * 
 * The provided function adds an event listener to a 'play' event of an invisible
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
