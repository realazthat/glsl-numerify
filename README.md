
glsl-numerify
---


####Description

glsl-numerify is a debugging shader generator for WebGL: given a texture, blows it up in size,
displays the pixel values as numbers.

See `glsl-numerify-demo.js` for usage.

####Example results

##### **Source texture, 4x4 (then scaled up)**:
![Example source texture](https://raw.githubusercontent.com/realazthat/glsl-numerify/master/docs/numerify-4x4-exemplar-scaled-up.png)

##### **Result, 256x256 (then scaled up)**:
![Result texture](https://raw.githubusercontent.com/realazthat/glsl-numerify/master/docs/numerify-4x4-result.png)

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


####Demo

To run the demo, run:

```
    cd ./glsl-numerify
    
    #install npm dependencies
    npm install
    
    #browser should open with the demo
    budo glsl-numerify-demo.js --open

    #note that if your resolution is small, it will render everything too small.
    #you can change the source texture size to see more satisfactory results.

```

Results:

branch | demo
-------|-------
master | [glsl-quad-demo](https://realazthat.github.io/glsl-quad/master/www/glsl-numerify-demo/index.html)
develop | [glsl-quad-demo](https://realazthat.github.io/glsl-quad/develop/www/glsl-numerify-demo/index.html)

####Usage

```
const numerify = require('./glsl-numerify.js');
```

##### `numerify.makeFrag ({multiplier, sourceSize, destinationCellSize, destinationSize, component = 'r'})`


* returns the webgl 1.0 fragment shader to use.
* `multiplier`
    1. the source texture is typically treated as a normalized floating point value between [0,1] in the shader.
    2. therefore, to get at the "real" value, you can supply a multiplier. So for example having a multiplier of
        256 will result values in the range [0,255]. The output values will always be integer only, so this
        typically needs to be used.
* `sourceSize` - a string in the form of a glsl vec2 with the source texture's size in pixels.
* `destinationCellSize` - a string in the form of a glsl vec2 with the size of each cell within the destination texture.
* `destinationSize` - the actual size of the destination texture; it might be exactly the same as
                      `sourceSize X destinationCellSize`.
* `component` - Which component of the input texture you are interested in rendering as digits.

##### `numerify.makeVert ()`

* returns the webgl 1.0 vertex shader to use.
