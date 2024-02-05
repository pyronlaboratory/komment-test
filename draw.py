def add(img):
    """
    def add(img):
    Draws a text “99” using the Arial font at the bottom-left corner of the image
    with red color and saves the modified image as ‘result.jpg’.

    Args:
        img (): THE INPUT PARAMETER 'IMG' IS PASSING THE IMAGE TO BE WORKED ON TO
            THIS FUNCTION.

    """
    draw = ImageDraw.Draw(img)
    myfont = ImageFont.truetype('C:/windows/fonts/Arial.ttf', size=40)
    fillcolor = "#ff0000"
    width, height = img.size
    draw.text((width-40, 0), '99', font=myfont, fill=fillcolor)
    img.save('result.jpg','jpeg')
