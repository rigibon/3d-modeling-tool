export var vGrid: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main(void) {
  vec4 Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0); 
  gl_Position = vec4(Position);
}
`;

export var fGrid: string = `#version 300 es
precision mediump float;

uniform vec3 lineColor;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(lineColor, 1.0);
}
`;
