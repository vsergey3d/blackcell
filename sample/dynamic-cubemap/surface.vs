
attribute vec3 position;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec2 uv;

uniform mat3 mxNT;
uniform mat4 mxT;
uniform mat4 mxVP;

varying vec2 vUV;
varying vec3 vPos;
varying vec3 vNormal;
varying mat3 vInvTBN;

void main() {

    vec4 pos = mxT * vec4(position, 1.0);
    gl_Position = mxVP * pos;

    vUV = uv;
    vPos = pos.xyz;
    vNormal = normalize(mxNT * normal);

    vec3 t = normalize(mxNT * tangent);
    vec3 b = cross(t, vNormal);

    vInvTBN = mat3(
        t.x, b.x, vNormal.x,
        t.y, b.y, vNormal.y,
        t.z, b.z, vNormal.z
    );
}
