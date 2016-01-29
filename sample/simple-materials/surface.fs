
uniform vec3 viewPos;

uniform float ambientIntensity;
uniform samplerCube ambientCube;
uniform samplerCube environmentCube;

uniform sampler2D heightMap;
uniform float parallaxScale;

uniform vec4 color;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;

uniform vec3 specularColor;
uniform float specularIntensity;
uniform float specularPower;
uniform sampler2D specularMap;

uniform float reflectionIntensity;
uniform float fresnelOffset;
uniform float fresnelPower;

uniform float transparency;

uniform vec3 lightPos[LIGHT_COUNT];
uniform vec4 lightColor[LIGHT_COUNT];
uniform vec4 lightParam[LIGHT_COUNT];

varying vec2 vUV;
varying vec3 vPos;
varying mat3 vInvTBN;

#define PARALLAX_HEIGHT_STEPS 12

vec2 computeParallax(vec3 view, vec2 uv)
{
	const float numSteps = float(PARALLAX_HEIGHT_STEPS);
	float step = 1.0 / numSteps;
	vec2 duv = view.xy * parallaxScale / (numSteps * view.z);
	float height = 1.0;
	float h = texture2D(heightMap, uv).r;
	for (int i = 0; i < PARALLAX_HEIGHT_STEPS; i++)
	{
	   if (h < height) {
	       height -= step;
	       uv -= duv;
	       h = texture2D(heightMap, uv).r;
	   }
	}
	vec2  prev = uv + duv;
	float hPrev = texture2D(heightMap, prev).r - (height + step);
	float hCur = h - height;
	float weight = hCur / (hCur - hPrev );
	return weight * prev + (1.0 - weight) * uv;
}

float computeFresnel (vec3 view, vec3 reflectVN, float offset, float power) {

    return offset + (1.0 - offset) * pow(1.0 + dot(view, normalize(reflectVN - view)), power);
}

float computeAttenuation(float distance, float radius, float deviation, float cutoff) {

    float attenuation = 1.0 / ((distance * distance) / (radius * radius) * deviation + 1.0);
    deviation = 1.0 / (deviation + 1.0);
    return max(0.0, ((attenuation - deviation) / (1.0 - deviation) - cutoff) / (1.0 - cutoff));
}

vec3 computePointLight(vec3 normal, vec3 reflectVN, vec3 albedo, vec2 uv,
    vec3 dir, vec3 color, float radius, float intensity, float deviation, float cutoff) {

    float dist = length(dir);
    dir /= dist;

    float dotNL = clamp(dot(normal, dir), 0.0, 1.0);
    float attenuation = computeAttenuation(dist, radius, deviation, cutoff);
    float term = dotNL * attenuation * intensity;

    vec3 result = albedo * color * term;
#ifdef SPECULAR
    if (dotNL > 0.0) {
        term *= pow(clamp(dot(reflectVN, dir), 0.0, 1.0), specularPower) *
            specularIntensity * texture2D(specularMap, uv).r;
        result += (color * specularColor * term);
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
    vec3 normal = normalize(texture2D(normalMap, uv).rgb * 2.0 - 1.0) * vInvTBN;
    vec3 reflectVN = normalize(reflect(view, normal));

    vec3 albedo = texture2D(albedoMap, uv).rgb * color.rgb;
#ifdef REFLECTION
    vec3 reflection = textureCube(environmentCube, reflectVN).rgb;
    float fresnel = computeFresnel(view, reflectVN, fresnelOffset, fresnelPower);
    albedo = mix(albedo, reflection, fresnel * reflectionIntensity);
#endif
    vec3 result = albedo * textureCube(ambientCube, normal).rgb * ambientIntensity;
    for (int i = 0; i < LIGHT_COUNT; i++) {
        vec3 dir = lightPos[i] - vPos.xyz;
        vec4 params = lightParam[i];
        result += computePointLight(normal, reflectVN, albedo, uv,
            dir, lightColor[i].rgb, params.x, params.y, params.z, params.w);
    }
    gl_FragColor = vec4(result, transparency);
}