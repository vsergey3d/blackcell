
vec4 floatToRGBA (float depth) {

	const vec4 shift = vec4(
        256 * 256 * 256,
        256 * 256,
        256,
        1.0
	);
	const vec4 mask = vec4(
        0,
        1.0 / 256.0,
        1.0 / 256.0,
        1.0 / 256.0
	);
	vec4 comp = fract(depth * shift);
	return comp - comp.xxyz * mask;
}

void main() {

	gl_FragColor = floatToRGBA(gl_FragCoord.z);
}
