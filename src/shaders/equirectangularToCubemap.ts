export var vEquirectangularToCubemap: string = `#version 300 es
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

export var fEquirectangularToCubemap: string = `#version 300 es
precision mediump float;

in vec3 worldPos;

uniform sampler2D equirectangularMap;

out vec4 fragColor;

const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 SampleSphericalMap(vec3 v)
{
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}

void main()
{
    vec2 uv = SampleSphericalMap(normalize(worldPos));
    vec3 color = texture(equirectangularMap, uv).rgb;
    
    fragColor = vec4(color, 1.0);
}
`;