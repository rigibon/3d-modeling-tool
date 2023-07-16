export var vCursorEditingShader: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform vec3 position;

uniform int radius;

flat out int radius2;

void main(void) {
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);

  radius2 = radius;
}
`;

export var fCursorEditingShader: string = `#version 300 es
precision mediump float;

flat in int radius2;

out vec4 fragColor;

float circle(vec2 st, float radius) {
  vec2 dist = st - vec2(0.5);
  return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(dist, dist) * 4.0);
}

void main(void) {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);

  if (radius2 == 1) {
    fragColor = vec4(0.1, 0.1, 0.1, 0.5);
  }
}
`;