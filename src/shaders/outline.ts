export var vOutline: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;
in vec3 normal;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;

void main(void) {
  // TODO: Scale outline shape with normals instead of using the view matrix.
  vec4 Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0); 
  gl_Position = vec4(Position.xy, 0.0, Position.w);
}
`;

export var fOutline: string = `#version 300 es
precision mediump float;

uniform vec3 lineColor;

out vec4 fragColor;

void main(void) {
  // fragColor = vec4(1.0, 0.5, 0.0, 1.0);
  fragColor = vec4(lineColor, 1.0);
}
`;
