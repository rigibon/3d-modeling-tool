export var vIrradianceConvolution: string = `#version 300 es
precision mediump float;

in vec3 vertexPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

out vec3 worldPos;

void main()
{
    worldPos = vertexPosition;  
    gl_Position =  projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`;

export var fIrradianceConvolution: string = `#version 300 es
precision mediump float;

in vec3 worldPos;

const float PI = 3.14159265359;

uniform samplerCube environmentMap;

out vec4 fragColor;

void main()
{
    vec3 N = normalize(worldPos);

    vec3 irradiance = vec3(0.0);   
    
    // tangent space calculation from origin point
    vec3 up    = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, N));
    up         = normalize(cross(N, right));
       
    float sampleDelta = 0.025;
    float nrSamples = 0.0;
    for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
    {
        for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
        {
            // spherical to cartesian (in tangent space)
            vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
            // tangent space to world
            vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 

            irradiance += texture(environmentMap, sampleVec).rgb * cos(theta) * sin(theta);
            nrSamples++;
        }
    }
    irradiance = PI * irradiance * (1.0 / float(nrSamples));
    
    fragColor = vec4(irradiance, 1.0);
}
`;