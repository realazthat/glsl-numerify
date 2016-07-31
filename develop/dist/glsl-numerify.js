(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.glslNumerify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function makeVert () {
  let vert = `
    precision mediump float;
    attribute vec2 a_position;
    attribute vec2 a_uv;
    uniform float u_clip_y;
    varying vec2 v_uv;
    
    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_position * vec2(1,u_clip_y), 0, 1);
    }
  `;
  return vert;
}

function makeFrag ({multiplier, sourceSize, destinationCellSize, destinationSize, component = 'r'}) {
  let frag = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D digits_texture;
    uniform sampler2D source_texture;

    // width of 4. 4 = 3 pixels for the digit, one pixel for white space.
    const vec2 digit_size = vec2(4,7);
    // hardcoded expected size in pixels of the digits texture.
    const vec2 digit_texture_size = vec2(64, 64);
    // the size, in pixels, of the source texture.
    const vec2 source_size = ${sourceSize};
    // the size of each cell in the destination texture.
    const vec2 destination_cell_size = ${destinationCellSize};
    // the size of the destination texture.
    const vec2 destination_size = ${destinationSize};
    // the size required for displaying the source image, given the destination cell size.
    const vec2 destination_view_size = ${sourceSize} * ${destinationCellSize};
    const vec4 multiplier = vec4(${multiplier});
    void main () {

      highp vec2 screen_rel_pixel = floor(v_uv*destination_size);
      highp vec2 screen_rel_cell = floor(screen_rel_pixel / destination_cell_size);
      highp vec2 screen_rel_cell_lower_pixel = screen_rel_cell * destination_cell_size;
      highp vec2 screen_rel_cell_upper_pixel = screen_rel_cell_lower_pixel + destination_cell_size;
      highp vec2 screen_rel_cell_center_pixel = screen_rel_cell_lower_pixel + (destination_cell_size / 2.0);
      highp vec2 cell_rel_offset_pixel = screen_rel_pixel - screen_rel_cell_lower_pixel;

      highp vec2 source_uv = (screen_rel_cell + .5)/source_size;


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
      // digits_uv = (vec2((digit*int(digit_size.x)) + digit_rel_x,  destination_cell_size.y -  cell_top_border - cell_rel_offset_pixel.y) + vec2(.5))/digit_texture_size;
      digits_uv = (vec2((digit*int(digit_size.x)) + digit_rel_x, cell_rel_offset_pixel.y - cell_top_border) + vec2(.5))/digit_texture_size;

      gl_FragColor = texture2D(digits_texture, digits_uv);
    }
  `;
  return frag;
}

const dataUri = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACq
                 aXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAAB
                 J0Ad5mH3gAAADaSURBVHhe7ZTBCcJAFAUtxKNNeLP/XsQSVgzvh7C4GjR7mhkI
                 w8/PQhhCTg3OEuB+vqzXlpr7/bu5d7//Z57JGmDrYu88ctHPxbfzo3NH8jHA43
                 pb/Lpf1xFzMdr380x2fQGjFxk9X/Tnf93P5JB/QDHa93Oxdz+TJQAZA8RYDBBj
                 MUCMxQAxFgPEWAwQYzFAjMUAMRYDxFgMEGMxQIzFADEWA8RYDBBjMUCMxQAxFg
                 PEWAwQYzFAjMUAMRYDxFgMEGMxQIzFADEWA8RYDBBjMUCMxQAxFniA1p4Bvgzd
                 SrofxgAAAABJRU5ErkJggg==`
                    .replace(' ', '').replace('\n', '').replace('\r', '');
const digits = {uri: dataUri};

module.exports = { makeFrag: makeFrag, makeVert: makeVert, digits };

},{}]},{},[1])(1)
});