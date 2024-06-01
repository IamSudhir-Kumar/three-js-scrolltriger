uniform float time;
varying vec2 vUv;
varying vec4 vPosition;
varying vec3 vNormal;
uniform vec2 pixels;
float PI = 3.1415926535897932384626433832795;

void main() {
    vUv = uv;
    vNormal = normal;
    
    // More dynamic wave effect
    float waveFrequency = 2.0; // Increase the frequency for more waves
    float waveAmplitude = 0.02; // Adjust the amplitude for stronger waves
    float waveSpeed = 2.0; // Adjust the speed for faster movement
    vec3 newPosition = position;
    
    // Apply a dynamic wave based on time and position
    float waveOffsetX = sin(time * waveSpeed) * 0.1; // Add variation over time
    float waveOffsetY = cos(time * waveSpeed) * 0.1; // Add variation over time
    newPosition.x += cos((newPosition.y + waveOffsetY) * waveFrequency + time + waveOffsetX) * waveAmplitude;
    newPosition.y += sin((newPosition.x + waveOffsetX) * waveFrequency + time + waveOffsetY) * waveAmplitude;

    // Compute the final position
    vPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * vPosition;
}
