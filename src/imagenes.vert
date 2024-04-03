#version 300 es
in vec2 aPosicion;
in vec2 aTexCoord;
uniform mat4 uMvpMatrix;
out vec2 vTexCoord;
void main() {
    gl_Position = uMvpMatrix * vec4(aPosicion, 0.0f, 1.0f);
    vTexCoord = aTexCoord;
}