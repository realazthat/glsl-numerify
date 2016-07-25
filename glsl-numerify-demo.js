
const resl = require('resl');
const regl = require('regl')({
  extensions: ['OES_texture_float', 'OES_texture_float_linear']
});

const numerify = require('./glsl-numerify.js');



const quadVerts = [
  [-1.0, -1.0, 0.0], [-1.0, 1.0, 0.0], [1.0, -1.0, 0.0], [1.0, 1.0, 0.0]
];

const quadIndices = [
  [3, 1, 0], [0, 2, 3]
];

const quadVertexShader = `
  precision mediump float;
  attribute vec3 position;
  varying vec2 vUv;
  
  void main() {
    vUv = position.xy/2.0 + .5;
    vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position, 1);
  }
`;

const quadFragShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D tex;
  void main () {
    gl_FragColor = texture2D(tex,vUv);
  }
`;

function makeFBORgbUint8 ({width, height}) {
  return regl.framebuffer({
    color: regl.texture({
      width: width,
      height: height,
      stencil: false,
      colorFormat: 'rgba',
      colorType: 'uint8',
      depth: false,
      wrap: 'clamp'
    })
  });
}

const drawToScreen = regl({
  frag: quadFragShader,
  vert: quadVertexShader,
  attributes: {
    position: quadVerts
  },
  elements: quadIndices,
  uniforms: {
    tex: regl.prop('texture')
  }
});

resl({
  manifest: {
    texture: {
      type: 'image',
      src: 'assets/numerify-32x32-exemplar.png',
      parser: (data) => regl.texture({
        data: data,
        mag: 'nearest',
        min: 'nearest'
      })
    }, digits_texture: {
      type: 'image',
      src: 'assets/digits.bmp',
      parser: (data) => regl.texture({
        data: data,
        mag: 'nearest',
        min: 'nearest'
      })
    }
  },
  onDone: ({texture, digits_texture}) => {
    console.log(texture.width);
    console.log(digits_texture.width);

    let fbo = makeFBORgbUint8({width: texture.width * 16, height: texture.height * 16});

    let frag = numerify.makeFrag({ multiplier: 256,
                                    sourceSize: `vec2(${texture.width}, ${texture.height})`,
                                    destinationSize: `vec2(${texture.width * 16}, ${texture.height * 16})`,
                                    destinationCellSize: 'vec2(16, 16)'});
    let vert = numerify.makeVert();

    console.log('vert:', vert);
    console.log('frag:', frag);

    const drawToDestination = regl({
      frag: frag,
      vert: vert,
      attributes: {
        position: quadVerts
      },
      elements: quadIndices,
      uniforms: {
        source_texture: regl.prop('source_texture'),
        digits_texture: regl.prop('digits_texture')
      },
      framebuffer: regl.prop('fbo')
    });

    drawToDestination({ source_texture: texture,
                        digits_texture: digits_texture,
                        fbo: fbo});

    drawToScreen({texture: fbo.color[0]});
  }
});
