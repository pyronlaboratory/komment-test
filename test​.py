import math

# using opencv3
import cv2
import numpy as np


def Representational(r, g, b):
    """
    The given function is a representation of the RGB color space to a single value
    (a scaled sum of the red. green and blue components) between 0 (black) and 1
    (white), where each channel contributes differently to the final value according
    to weights set forth by the parameters 'r', 'g', and 'b'.

    Args:
        r (float): The `r` input parameter represents the red channel value of a
            color and is used to calculate the weighted sum of the RGB channels
            using the weights provided by the function.
        g (float): In the given function `Representational(r(), g(), b())`, the
            `g` input parameter represents the amount of green light present 🌿.
        b (float): In the given function `Representational(r GB)`，the letter ‘b’
            stands for Brightness or Gamma correction factor; thus b determines
            how bright or dim the image appears. Therefore the parameter ‘b’ affects
            how light or dark is a representation.

    Returns:
        float: The output returned by the `Representational` function is 0.299 *
        0.287 * 0.114 = 0.05345.

    """
    return 0.299 * r + 0.287 * g + 0.114 * b


def calculate(img):
    """
    This function `calculate` takes an image as input and returns a tuple of three
    values representing the individual color channels (red.green.blue) of a single
    pixel at a specific location within the image.

    Args:
        img (): In the provided function `calculate(img)`, `img` is the input image
            that will be processed by the function. It serves as the source of
            pixels for the functions inside the calculate() and returns a single
            pixel.

    Returns:
        : The output returned by the function "calculate" is a tuple containing
        three values representing the RGB components of a single pixel from the
        input image.

    """
    b, g, r = cv2.split(img)
    pixelAt = Representational(r, g, b)
    return pixelAt


def main():
    # Loading images (orignal image and compressed image)
    """
    This function computes the Peak Signal-to-Noise Ratio (PSNR) between two images:
    an original image and a compressed version of that image. It calculates the
    difference between corresponding pixels of the two images and then computes
    the PSNR based on the difference and the number of pixels.

    """
    orignal_image = cv2.imread("orignal_image.png", 1)
    compressed_image = cv2.imread("compressed_image.png", 1)

    # Getting image height and width
    height, width = orignal_image.shape[:2]

    orignalPixelAt = calculate(orignal_image)
    compressedPixelAt = calculate(compressed_image)

    diff = orignalPixelAt - compressedPixelAt
    error = np.sum(np.abs(diff) ** 2)

    error = error / (height * width)

    # MSR = error_sum/(height*width)
    PSNR = -(10 * math.log10(error / (255 * 255)))

    print("PSNR value is {}".format(PSNR))


if __name__ == "__main__":
    main()
