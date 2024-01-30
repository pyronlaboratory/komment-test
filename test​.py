import math

# using opencv3
import cv2
import numpy as np


def Representational(r, g, b):
    """
    This function performs a representation of the RGB color model to a single
    grayscale value. It takes three parameters (red (r), green (g), and blue (b))
    and uses their values to compute a grayscale value based on the Color Space
    Conversion formula for Representational Colorimetric Rendering Intent. In
    simpler terms - it converts an RGB image to greyscale.

    Args:
        r (float): In the given function `Representational`, the `r` input parameter
            represents the amount of red color content presentin the image.
        g (int): The `g` input parameter represents the Green channel of a RGB
            color model and is used to calculate the Red (R) and Blue (B) components
            of the output color through the following formulae:
            
            0/287 * g
            
            So the `g` parameter determines how much green component there should
            be on the resulting image's final red channel value for a given input
            color value along with RGB red and blue values being computed separately
            without caring about actual Gain channel itself which does not affect
            or get included into computing final output’s red-blue balanced
        b (int): The `b` input parameter represents blue channel and its value is
            used to compute the red component of the resulting color.

    Returns:
        float: The output returned by the `Representational` function is a single
        number that represents the brightness of the color (ranging from 0 to 1).
        
        In this case:
        
        `Returns: 0.299 * r + 0.287 * g + 0.114 * b`
        
        `r`, `g`, and `b` are the red Green and Blue color components.
        The return value is a single number between 0-1 representing brightness/grayscale
        equivalent.
        In this function the grey level will always be very near or exactly half
        way to max white(255)

    """
    return 0.299 * r + 0.287 * g + 0.114 * b


def calculate(img):
    """
    This function takes an image as input and returns a tuple of three pixels
    (red(r), green(g), and blue(b)) representing the color of a single pixel at
    the center of the image.

    Args:
        img (): The `img` input parameter is a picture or an image that is being
            passed as an argument into the function named `calculate`. It then
            undergoes division and separates each color element with split. Then
            takes those separate parts and represents it into the function named
            `pixelAt` and returns a picture.

    Returns:
        : The output returned by the function "calculate" is a "Representational"
        object (which is a class or struct), containing the values of the three
        color channels (red(), green(), and blue()) of a pixel from the input image.

    """
    b, g, r = cv2.split(img)
    pixelAt = Representational(r, g, b)
    return pixelAt


def main():
    # Loading images (orignal image and compressed image)
    """
    This function calculates the peak signal-to-noise ratio (PSNR) between two
    images: an original image and a compressed version of that image. It compares
    the corresponding pixels of the two images and calculates the average difference
    between them. The PSNR value is then printed.

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
