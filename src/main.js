/** glsl source code for simplest possible vertex shader */
const VERTEX_SHADER_SRC = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/** fragment shader adapted from shadertoy */
const FRAGMENT_SHADER_SRC = `#version 300 es
precision mediump float;
out vec4 fragColor;
uniform float uTime;
uniform vec2 uResolution;

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 col = 0.5 + 0.5*cos(uTime+uv.xyx+vec3(0,2,4));
  fragColor = vec4(col,1.0);
}`;

const RES_WIDTH = 1920;
const RES_HEIGHT = 1080;

/** helper function to log shader compilation errors */
const shaderLog = (
  /** @type {string} */ name,
  /** @type {WebGLShader} */ shader
) => {
  const output = gl.getShaderInfoLog(shader);
  if (output !== "") console.log(`${name} shader info log\n${output}`);
};

// n.b. the `#version` pragma in the fragment shader has to be the very first
// line. there can't be any kind of whitespace before it or it will break!

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("gl"));
const gl = canvas.getContext("webgl2");
canvas.width = RES_WIDTH;
canvas.height = RES_HEIGHT;

// define drawing area of canvas
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

// create a buffer object to store vertices
const buffer = gl.createBuffer();

// point buffer at graphic context's ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// vertices for two big triangles
const verts = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
const triangles = new Float32Array(verts);

// initialize memory for buffer and populate it
// give opengl hint that contents will not change dynamically
gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

// create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, VERTEX_SHADER_SRC);
gl.compileShader(vertexShader);
shaderLog("vertex", vertexShader);

// create fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SRC);
gl.compileShader(fragmentShader);
shaderLog("fragment", fragmentShader);

// create shader program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// n.b. all attribute and uniform initialization must come after creating,
// linking and using the shader program

// find a pointer to the uniform "time" in our fragment shader
const uTime = gl.getUniformLocation(program, "uTime");

// find a pointer to the uniform "time" in our fragment shader
const uResolution = gl.getUniformLocation(program, "uResolution");
gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);

// get position attribute location in shader
const position = gl.getAttribLocation(program, "aPosition");

// enable the attribute
gl.enableVertexAttribArray(position);

// this will point to the vertices in the last bound array buffer. here we're
// only use one array buffer, where we're storing our vertices
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

/** renders to the screen, updating the time, calling itself repeatedly */
const render = (/** @type {number} */ time) => {
  // update time on the GPU
  gl.uniform1f(uTime, time / 1000);

  // draw triangles using the array buffer from index 0 to 6
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // schedules render to be called the next time the video card requests
  // a frame of video
  requestAnimationFrame(render);
};

// kick off the animation loop
requestAnimationFrame(render);
