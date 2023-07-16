export var vTransformGizmo: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main(void) {
  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
}
`;

export var fTransformGizmo: string = `#version 300 es
precision mediump float;

uniform vec3 color;
uniform int isBall;

out vec4 fragColor;

void main(void) {
  // if (isBall == 0) {
  //   
  // } else {
    if (isBall == 1) {
      fragColor = vec4(color, 0.1);
    } else {
      fragColor = vec4(color, 1.0);
    }
      
  // }
}
`;