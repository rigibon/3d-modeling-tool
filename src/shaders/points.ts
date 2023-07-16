export var vPoint: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main(void) {
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
  gl_PointSize = 5.0;
}
`;

export var fPoint: string = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main(void) {
  vec4 highlightColor = vec4(0.2, 0.2, 0.2, 1.0);

  fragColor = highlightColor;
}
`;