from PIL import Image

img = Image.open('public/assets/logo.png').convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    # If the pixel is white or very close to white
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        # replacing it with a transparent pixel
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save('public/assets/logo_transparent.png', "PNG")
print("Background removed and saved to logo_transparent.png")
