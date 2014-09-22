
uniform vec3 viewPos;

uniform float ambientIntensity;
uniform samplerCube ambientCube;

uniform sampler2D albedoMap;
uniform sampler2D normalMap;

uniform vec4 specularColor;
uniform float specularIntensity;
uniform float specularPower;
uniform sampler2D specularMap;

uniform vec3 lightDir;
uniform float lightIntensity;

varying vec2 vUV;
varying vec3 vPos;
varying mat3 vInvTBN;

vec3 computeDirectionalLight(vec3 normal, vec3 reflectVN, vec3 albedo, vec2 uv,
    vec3 dir, float intensity) {

    dir = normalize(dir);
    float dotNL = clamp(dot(normal, dir), 0.0, 1.0) * 0.5 + 0.5;
    float term = dotNL * intensity;

    vec3 result = albedo * term;
    if (term > 0.0) {
        term *= pow(clamp(dot(reflectVN, dir), 0.0, 1.0), specularPower) *
            specularIntensity * texture2D(specularMap, uv).r;
        result += (specularColor.rgb * term);
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
        computeDirectionalLight(normal, reflectVN, albedo, uv, lightDir, lightIntensity);

    gl_FragColor = vec4(result, 1.0);
}