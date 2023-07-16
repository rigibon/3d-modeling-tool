export var generate_skybox_vertex_shader: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

out vec3 localPos;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main()
{
    localPos = vertexPosition;  
    gl_Position =  projectionMatrix * viewMatrix * vec4(vertexPosition, 1.0);
}
`;

export var generate_skybox_fragment_shader: string = `#version 300 es
#define M_PI 3.1415926535897932384626433832795

precision highp float;

out vec4 fragColor;
in vec3 localPos;

uniform sampler2D environmentMap;
uniform int isHDR;

const vec2 invAtan = vec2(1.0 / (2.0 * M_PI), 1.0 / M_PI);
vec2 SampleSphericalMap(vec3 v)
{
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}

void main()
{       
    vec2 uv = SampleSphericalMap(normalize(localPos)); // make sure to normalize localPos
    vec3 tempColor = isHDR == 1 ? texture(environmentMap, uv).rgb : pow(texture(environmentMap, uv).rgb, vec3(2.2));
    
    fragColor = vec4(tempColor, 1.0);
    //color = vec4 (0.0,1.0,0.0,1.0);
}
`;
