
attribute vec3 position;

uniform mat4 mxT;
uniform mat4 mxVP;

void main() {

	gl_Position = mxVP * mxT * vec4(position, 1.0);
}
