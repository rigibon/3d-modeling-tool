export var vMatcap: string = `#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normal;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_view;
out vec3 vNormal;
out mat4 view;
void main(void) {
  gl_Position = u_projection * u_view * u_world * vec4(vertexPosition, 1.0);
  vNormal = normalize(vec3(u_world * vec4(normal, 0.0)));
  view = u_view;
}
`;

export var fMatcap: string = `#version 300 es
precision mediump float;

in vec3 vNormal;
in mat4 view;

uniform sampler2D matcapTexture;

out vec4 fragColor;

void main(void) {
  vec2 muv = vec2(view * vec4(normalize(vNormal), 0.0)) * 0.5 + vec2(0.5, 0.5);
  fragColor = texture(matcapTexture, vec2(muv.x, 1.0 - muv.y));
}
`;
