
uniform vec3 viewPos;

uniform float ambientIntensity;
uniform samplerCube ambientCube;
uniform samplerCube environmentCube;

uniform sampler2D heightMap;
uniform float parallaxScale;

uniform vec4 color;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;

uniform float specularIntensity;
uniform float specularPower;

uniform float reflectionIntensity;
uniform float fresnelOffset;
uniform float fresnelPower;

uniform vec3 lightDir;
uniform float lightIntensity;

varying vec2 vUV;
varying vec3 vPos;
varying vec3 vNormal;
varying mat3 vInvTBN;

vec2 computeParallax(vec3 view, vec2 uv) {

    const float bias = 0.01;
    float height = parallaxScale * texture2D(heightMap, uv).r - bias;
    return uv - min(height * view.xy, vec2(bias));
}

float computeFresnel (vec3 view, vec3 reflectVN, float offset, float power) {

    return offset + (1.0 - offset) * pow(1.0 + dot(view, normalize(reflectVN - view)), power);
}

vec3 computeDirectionalLight(vec3 normal, vec3 reflectVN, vec3 albedo, vec2 uv,
    vec3 dir, float intensity) {

    dir = normalize(dir);
    float dotNL = clamp(dot(normal, dir), 0.0, 1.0) * 0.5 + 0.5;
    float term = dotNL * intensity;

    vec3 result = albedo * term;
#ifdef SPECULAR
    if (term > 0.0) {
        term *= pow(clamp(dot(reflectVN, dir), 0.0, 1.0), specularPower) * specularIntensity;
        result += term;
    }
#endif
    return result;
}

void main() {

    vec3 view = normalize(vPos.xyz - viewPos);
    vec2 uv = vUV;
#ifdef PARALLAX
    uv = computeParallax(vInvTBN * view, uv);
#endif
    vec3 normal = normalize(vNormal);
#ifdef NORMAL_MAP
    normal = normalize(texture2D(normalMap, uv).rgb * 2.0 - 1.0) * vInvTBN;
#endif
    vec3 reflectVN = normalize(reflect(view, normal));

    vec3 albedo = color.rgb;
#ifdef ALBEDO_MAP
    albedo = texture2D(albedoMap, uv).rgb;
#endif
#ifdef REFLECTION
    vec3 reflection = textureCube(environmentCube, reflectVN).rgb;
    float fresnel = computeFresnel(view, reflectVN, fresnelOffset, fresnelPower);
    albedo = mix(albedo, reflection, fresnel * reflectionIntensity);
#endif
    vec3 result = albedo * textureCube(ambientCube, normal).rgb * ambientIntensity +
        computeDirectionalLight(normal, reflectVN, albedo, uv, lightDir, lightIntensity);

    gl_FragColor = vec4(result, 1.0);
}