export var vBackground: string = `#version 300 es
precision mediump float;

in vec3 a_position;
out vec3 texcoords;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
void main()
{
    vec4 pos = projectionMatrix * viewMatrix * vec4(a_position, 0);
    gl_Position = pos.xyww;
    texcoords = a_position;
}
`;

export var fBackground: string = `#version 300 es
precision mediump float;

out vec4 fragColor;
in vec3 texcoords;
uniform samplerCube environmentMap;

void main()
{
    // vec3 envColor = texture(environmentMap, worldPos).rgb;
    //
    // // HDR tonemap and gamma correct
    // envColor = envColor / (envColor + vec3(1.0));
    // envColor = pow(envColor, vec3(1.0/2.2)); 

    // fragColor = vec4(envColor, 1.0);
    fragColor = texture(environmentMap, texcoords);
}
`;