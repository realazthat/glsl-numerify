
function makeVert () {
  let vert = `
    precision mediump float;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    
    void main() {
      // vUv = uv;
      vUv = position.xy / 2.0 + .5;
      gl_Position = vec4(position, 1);
    }
  `;
  return vert;
}

function makeFrag ({multiplier, sourceSize, destinationCellSize, destinationSize, component = 'r'}) {
  let frag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D digits_texture;
    uniform sampler2D source_texture;

    const vec2 digit_size = vec2(4,7);
    const vec2 digit_texture_size = vec2(64, 64);
    const vec2 source_size = ${sourceSize};
    const vec2 destination_cell_size = ${destinationCellSize};
    const vec2 destination_size = ${destinationSize};
    const vec2 destination_view_size = ${sourceSize} * ${destinationCellSize};
    const vec4 multiplier = vec4(${multiplier});
    void main () {
      // gl_FragColor = texture2D(source_texture, vUv);
      // gl_FragColor = vec4(vUv, 0,1);
      // return;

      highp vec2 screen_rel_pixel = floor(vUv*destination_size);
      highp vec2 screen_rel_cell = floor(screen_rel_pixel / destination_cell_size);
      highp vec2 screen_rel_cell_lower_pixel = screen_rel_cell * destination_cell_size;
      highp vec2 screen_rel_cell_upper_pixel = screen_rel_cell_lower_pixel + destination_cell_size;
      highp vec2 screen_rel_cell_center_pixel = screen_rel_cell_lower_pixel + (destination_cell_size / 2.0);
      highp vec2 cell_rel_offset_pixel = screen_rel_pixel - screen_rel_cell_lower_pixel;

      highp vec2 source_uv = (screen_rel_cell + .5)/source_size;

      // gl_FragColor = vec4(vUv,0,1);
      // gl_FragColor = texture2D(source_texture, vUv);
      // return;

      gl_FragColor = vec4(1,1,1,1);


      if (any(greaterThan(screen_rel_pixel, destination_view_size)))
        return;

      if (any(lessThan(cell_rel_offset_pixel, vec2(1))) || any(greaterThan(cell_rel_offset_pixel, destination_cell_size)))
      {
        gl_FragColor = vec4(0,0,1,1);
        return;
      }

      vec4 source_pixel = texture2D(source_texture, source_uv);
      vec4 denormed_source_value = source_pixel*multiplier;

      float cell_rel_right_offset_pixel = destination_cell_size.x - 1.0 - cell_rel_offset_pixel.x;
      int digit_index = int(floor(cell_rel_right_offset_pixel / digit_size.x));
      int digit_rel_x = int(digit_size.x) - int(floor(mod(cell_rel_right_offset_pixel, digit_size.x)));
      /// center of cell, plus half digit hight.
      int cell_rel_digit_bottom_y = int((destination_cell_size.y / 2.0) + digit_size.y / 2.0);
      int cell_rel_dist_from_digit_bottom = cell_rel_digit_bottom_y - int(cell_rel_offset_pixel.y);

      int sigdigits = int(floor(denormed_source_value.${component} / pow(10.0, float(digit_index))));
      if (sigdigits == 0)
          return;
      int digit = int(mod(float(sigdigits), 10.0));

      vec2 digits_uv = vec2(float(digit)*digit_size.x, digit_size.y - float(cell_rel_dist_from_digit_bottom)) / digit_texture_size;


      float cell_top_border = floor((destination_cell_size.y - digit_size.y) / 2.0);
      digits_uv = (vec2((digit*int(digit_size.x)) + digit_rel_x,  cell_rel_offset_pixel.y - cell_top_border) + vec2(.5))/digit_texture_size;

      gl_FragColor.rg = digits_uv;
      gl_FragColor = texture2D(digits_texture, digits_uv);
    }
  `;
  return frag;
}

module.exports = { makeFrag: makeFrag, makeVert: makeVert };
