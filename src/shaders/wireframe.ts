export var vWireframe: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main(void) {
  vec4 pos = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
  pos[3] += 0.002;
  gl_Position = pos;
}
`;

export var fWireframe: string = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(0.2, 0.2, 0.2, 1.0);
}
`;
