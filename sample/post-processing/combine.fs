
uniform sampler2D sourceMapA;
uniform sampler2D sourceMapB;

varying vec2 vUV;

void main() {

	gl_FragColor = vec4(texture2D(sourceMapA, vUV).rgb + texture2D(sourceMapB, vUV).rgb, 1.0);
}
