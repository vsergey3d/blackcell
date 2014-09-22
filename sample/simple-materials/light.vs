
attribute vec3 position;

uniform mat4 mxVP;
uniform float index;
uniform vec3 lightPos[LIGHT_COUNT];

void main() {

    gl_Position = mxVP * vec4(position + lightPos[int(index)], 1.0);
}
