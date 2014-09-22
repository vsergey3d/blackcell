
attribute vec3 position;

varying vec2 vUV;

void main() {

    gl_Position = vec4(position, 1.0);
    vUV = position.xy * 0.5 + 0.5;
}
