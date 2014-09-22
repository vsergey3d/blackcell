
uniform samplerCube environmentCube;

varying vec3 vUV;

void main() {

    gl_FragColor = vec4(textureCube(environmentCube, normalize(vUV)).rgb, 1.0);
}
