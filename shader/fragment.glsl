uniform float time;
uniform float progress;
uniform sampler2D firstTexture;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;
varying vec3 vNormal;

// Simple hash function
float hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p.x * 43758.5453123 + p.y * 37848.99837) * 43758.5453123);
}

// 2D noise function
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Lighting calculation
vec3 calculateLighting(vec3 normal, vec3 lightDir, vec3 lightColor) {
    float diff = max(dot(normal, lightDir), 0.0);
    return lightColor * diff;
}

void main() {
    vec3 lightDir = normalize(vec3(0.902, 0.0745, 0.0745));
    vec3 lightColor = vec3(0.4039, 0.2784, 0.8549);
    
    // Normalized normal
    vec3 norm = normalize(vNormal);
    
    // Calculate lighting
    vec3 lighting = calculateLighting(norm, lightDir, lightColor);

    // Get texture color
    vec4 txt = texture2D(firstTexture, vUv);

    // Adding dynamic flow effect to the texture
    vec2 flowUv = vUv + vec2(sin(time * 0.5), cos(time * 0.5)) * 0.05;
    vec4 flowTxt = texture2D(firstTexture, flowUv);

    // Adding bright noise
    float n = noise(vUv * 10.0 + time * 0.1);
    vec3 noiseColor = vec3(n * 0.5 + 0.5);

    // Brightening the texture color
    vec3 brightColor = flowTxt.rgb * 1.5;

    // Mix the bright texture color with the noise color
    vec3 finalColor = mix(brightColor, noiseColor, 0.3);
    
    // Combine texture color with lighting effect
    finalColor = mix(finalColor, lighting, 0.5);

    // Ensure the final color is bright and visible
    finalColor = clamp(finalColor * 1.5, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
}
