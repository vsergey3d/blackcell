
uniform float gaussianWeights[WEIGHT_COUNT];

uniform sampler2D sourceMap;
uniform vec2 sourceMapSize;

varying vec2 vUV;

#ifdef HORIZONTAL
vec2 computeUV(vec2 uv, vec2 texelSize, float offset) {
    return vec2(uv.x + offset * texelSize.x, uv.y);
}
#endif

#ifdef VERTICAL
vec2 computeUV(vec2 uv, vec2 texelSize, float offset) {
    return vec2(uv.x, uv.y + offset * texelSize.y);
}
#endif

void main() {

    vec2 texelSize = 1.0 / sourceMapSize;
    vec4 sum = vec4(0.0);

    for (int i = 1; i < WEIGHT_COUNT - 1; i++) {
        sum += texture2D(sourceMap, computeUV(vUV, texelSize, float(i))) * gaussianWeights[i];
        sum += texture2D(sourceMap, computeUV(vUV, texelSize, -float(i))) * gaussianWeights[i];
    }
    sum += texture2D(sourceMap, vUV) * gaussianWeights[0];

    gl_FragColor = vec4(sum.rgb, 1.0);
}
