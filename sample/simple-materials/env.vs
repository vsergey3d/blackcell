
attribute vec3 position;

uniform mat4 mxVP;
uniform vec3 viewPos;

varying vec3 vUV;

void main() {

    gl_Position = mxVP * vec4(position + viewPos, 1.0);
    gl_Position.z = gl_Position.w - 1e-5;

    vUV = position;
}
