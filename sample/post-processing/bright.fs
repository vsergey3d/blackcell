
uniform float scale;
uniform float threshold;
uniform float kernel[KERNEL_SIZE];

uniform sampler2D sourceMap;
uniform vec2 sourceMapSize;

varying vec2 vUV;

vec3 getBrightValue(vec2 uv) {

	vec3 sample = texture2D(sourceMap, uv).rgb;
	float luminance = max(sample.r, max(sample.g, sample.b));
	return sample * max(luminance - threshold, 0.0) * (1.0 / (1.0 - threshold)) * scale;
}

void main() {

    vec2 texelSize = 1.0 / sourceMapSize;
    vec3 average = vec3(0.0);

    for (int u = 0; u < KERNEL_SIZE; u++) {
        for (int v = 0; v < KERNEL_SIZE; v++) {
        	average += getBrightValue(vec2(vUV + vec2(kernel[u], kernel[v]) * texelSize));
        }
    }
	gl_FragColor = vec4(average / (float(KERNEL_SIZE) * float(KERNEL_SIZE)), 1.0);
}
