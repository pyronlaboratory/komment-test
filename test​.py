import math

# using opencv3
import cv2
import numpy as np


def Representational(r, g, b):
    """
    The function "Representational" takes the red (r), green (g), and blue (b)
    components of a color and returns their weighted sum using the coefficients
    0.299 for redness (R), 0.287 for greenness (G), and 0.114 for blueness (B).

    Args:
        r (float): The `r` input parameter represents the red channel of an RGB
            color triplet and is used to compute the corresponding weighted sum
            of the red component along with the green and blue components using
            the weights provided by the function.
        g (float): The `g` input parameter represents the amount of green color
            present into the final output of the representationational formula and
            adds 0.287 times the value of `g` to the overall color outcome
        b (int): The `b` input parameter represents blue and its value is multiplied
            by 0.114 and added to the sum of red and green values.

    Returns:
        float: The output returned by the function `Representational(r、g、b)` is:
        
        0/299 * r + 0.287 * g + 0.114 * b

    """
    return 0.299 * r + 0.287 * g + 0.114 * b


def calculate(img):
    """
    This function "calculate" takes an image as input and splits it into its red
    (R), green (G), and blue (B) channels using cv2.split() . Then it forms a
    representation of each pixel by combining the three channels (r , g , b) and
    returns a new array containing this representation for every pixel of the image.

    Args:
        img (): The `img` input parameter is an image that is being analyzed. It
            is split into its individual color channels (red (r), green (g), and
            blue (b)) using OpenCV's `cv2.split()` function. These channel values
            are then used as input to the `Representational` object constructor.

    Returns:
        int: The function `calculate()` returns a `Representational` object
        containing the RGB values of a single pixel from the input image.

    """
    b, g, r = cv2.split(img)
    pixelAt = Representational(r, g, b)
    return pixelAt


def main():
    # Loading images (orignal image and compressed image)
    """
    This function compares the quality of an original image and a compressed image
    by calculating the PSNR (Peak Signal-to-Noise Ratio) value between the two images.

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
