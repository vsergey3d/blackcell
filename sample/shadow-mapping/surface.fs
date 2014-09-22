
uniform vec3 viewPos;

uniform float ambientIntensity;
uniform samplerCube ambientCube;

uniform sampler2D albedoMap;
uniform sampler2D normalMap;

uniform vec4 specularColor;
uniform float specularIntensity;
uniform float specularPower;
uniform sampler2D specularMap;

uniform vec3 lightPos;
uniform vec3 lightDir;
uniform float lightAngle;
uniform vec4 lightColor;
uniform vec4 lightParam;

uniform vec2 shadowSamples[SHADOW_SAMPLE_COUNT];
uniform sampler2D shadowMap;
uniform vec2 shadowMapSize;

varying vec2 vUV;
varying vec3 vPos;
varying vec4 vPosLVP;
varying mat3 vInvTBN;

float rgbaToFloat(vec4 value) {

    const vec4 shift = vec4(
        1.0 / (256.0 * 256.0 * 256.0),
        1.0 / (256.0 * 256.0),
        1.0 / 256.0,
        1.0);
    return dot(value, shift);
}

float sampleShadow(vec2 uv, float depth) {

    vec2 texelSize = 1.0 / shadowMapSize;

    vec4 terms;
    terms.x = float(rgbaToFloat(texture2D(shadowMap, uv)) > depth);
    terms.y = float(rgbaToFloat(texture2D(shadowMap, uv + vec2(texelSize.x, 0))) > depth);
    terms.z = float(rgbaToFloat(texture2D(shadowMap, uv + vec2(0, texelSize.y))) > depth);
    terms.w = float(rgbaToFloat(texture2D(shadowMap, uv + texelSize)) > depth);

    vec2 fracts = fract(uv * shadowMapSize);
    vec2 result = mix(terms.xz, terms.yw, fracts.x);
    return mix(result.x, result.y, fracts.y);
}

float computeShadowTerm(vec4 positionLVP, float attenuation) {

    const float depthBias = 0.003;
    const float minSoftness = 1.0;
    const float maxSoftness = 10.0;

    vec2 offset = mix(maxSoftness, minSoftness, attenuation) / shadowMapSize;
    vec2 uv = positionLVP.xy / positionLVP.w;
    float depth = (positionLVP.z - depthBias) / positionLVP.w;

    float result = 0.0;
    for (int i = 0; i < SHADOW_SAMPLE_COUNT; i++) {
        result += sampleShadow(uv + shadowSamples[i] * offset, depth);
    }
    return result / float(SHADOW_SAMPLE_COUNT);
}

float computeAttenuation(float distance, float radius, float deviation, float cutoff) {

    float t = (distance * distance) / (radius * radius);
    float td = t * deviation;
    float attenuation = (deviation - td - t + 1.0) / (td * deviation + td + deviation + 1.0);
    return max(0.0, (attenuation - cutoff) / (1.0 - cutoff));
}

vec3 computeSpotLight(vec3 normal, vec3 reflectVN, vec3 albedo, vec2 uv,
    vec3 dir, vec3 spotDir, float dotAngle, vec3 color, float radius,
    float intensity, float deviation, float cutoff) {

    float dist = length(dir);
    dir /= dist;

    float dotNL = clamp(dot(normal, dir), 0.0, 1.0);
    float attenuation = computeAttenuation(dist, radius, deviation, cutoff);
    float term = dotNL * attenuation * intensity * computeShadowTerm(vPosLVP, attenuation) *
        computeAttenuation(1.0 - dot(dir, spotDir), 1.0 - dotAngle, deviation, 0.0);

    vec3 result = albedo * color * term;
    if (term > 0.0) {
        term *= pow(clamp(dot(reflectVN, dir), 0.0, 1.0), specularPower) *
            specularIntensity * texture2D(specularMap, uv).r;
        result += (color * specularColor.rgb * term);
    }
    return result;
}

void main() {

    vec3 view = normalize(vPos.xyz - viewPos);

    vec2 uv = vUV;
    vec3 normal = normalize(texture2D(normalMap, uv).rgb * 2.0 - 1.0) * vInvTBN;
    vec3 reflectVN = normalize(reflect(view, normal));

    vec3 albedo = texture2D(albedoMap, uv).rgb;
    vec3 result = albedo * textureCube(ambientCube, normal).rgb * ambientIntensity +
        computeSpotLight(normal, reflectVN, albedo, uv, lightPos - vPos.xyz, -lightDir,
            lightAngle, lightColor.rgb, lightParam.x, lightParam.y, lightParam.z, lightParam.w);

    gl_FragColor = vec4(result, 1.0);
}