
glsl-numerify
---


####Description

glsl-numerify is a debugging shader generator for WebGL: given a texture, blows it up in size,
displays the pixel values as numbers.

See `glsl-numerify-demo.js` for usage.

####How it works

Basically, it makes a cell for each input pixel.

1. For each output pixel, it figures out which cell it lies within.
2. For each output pixel, it figures out the offset within the cell it lies within.
3. Using the in-cell offset, it determines how far off the right of the cell the current
    output pixel is.
4. Using (3), it determines which digit place this output pixel lies within.
5. Using the cell <=> source pixel relationship, it determines the value of the source pixel.
6. Using (5), it determines what the digit value for that digit place is.
7. Using (6,2), it picks a pixel from the digits texture, which stores all the digits (`./assets/digits.bmp`).


####Dependencies

* nodejs
* browserify
* regl (for demo)
* resl (for demo)
* budo (for quick demo as an alternative to running browserify) 

To run the demo, run:

```
    cd ./glsl-numerify
    
    npm install
    
    #browser should open with the demo
    budo glsl-numerify-demo.js --open

    #note that if your resolution is small, it will render everything too small.
    #you can change the source texture size to see more satisfactory results.

```

