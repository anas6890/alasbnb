from PIL import Image

img = Image.open('public/assets/logo_transparent.png')
# getbbox returns the bounding box of non-zero alpha pixels
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
    img.save('public/assets/logo_transparent.png', "PNG")
    print("Image cropped successfully")
else:
    print("No bounding box found, image might be empty")
