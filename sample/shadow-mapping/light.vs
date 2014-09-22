
attribute vec3 position;

uniform mat4 mxVP;
uniform vec3 lightPos;

void main() {

    gl_Position = mxVP * vec4(position + lightPos, 1.0);
}
