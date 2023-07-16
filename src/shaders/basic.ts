export var vBasic: string = `#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec3 normal;
uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
out vec3 position;
flat out vec3 normalInterp;
void main(void) {
  vec4 vertPos4 = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
  position = vec3(vertPos4) / vertPos4.w;

  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);

  normalInterp = vec3(normalMatrix * vec4(normal, 0.0));
}
`;

export var fBasic: string = `#version 300 es
precision mediump float;

in vec3 position;
flat in vec3 normalInterp;

uniform vec3 lightPosition;

out vec4 fragColor;

void main(void) {
  vec3 tAmbientColor = vec3(0.4, 0.4, 0.4);
  vec3 tDiffuseColor = vec3(0.5, 0.5, 0.5);
  vec3 tSpecularColor = vec3(1.0, 1.0, 1.0);

  // vec3 N = normalize(normalInterp);
  vec3 N = normalize(cross(dFdx(position), dFdy(position)));
  vec3 L = normalize(lightPosition - position);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if (lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-position);
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 64.0);
  }

  fragColor = vec4(tAmbientColor * 0.9 + tDiffuseColor * lambertian * 0.5, 1.0);
  // fragColor = vec4(vNormal.x, vNormal.y, vNormal.z, 1.0);
}
`;
