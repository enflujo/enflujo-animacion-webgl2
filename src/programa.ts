import './scss/estilos.scss';
import { mat4 } from 'gl-matrix';
import vert from './imagenes.vert';
import frag from './imagenes.frag';

function main() {
  const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
  const gl = lienzo.getContext('webgl2') as WebGL2RenderingContext;

  const vShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vShader) return;
  gl.shaderSource(vShader, vert);
  gl.compileShader(vShader);
  let ok = gl.getShaderParameter(vShader, gl.COMPILE_STATUS);
  if (!ok) console.log(gl.getShaderInfoLog(vShader));

  const fShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fShader) return;
  gl.shaderSource(fShader, frag);
  gl.compileShader(fShader);
  ok = gl.getShaderParameter(fShader, gl.COMPILE_STATUS);
  if (!ok) console.log(gl.getShaderInfoLog(fShader));

  const programa = gl.createProgram();
  if (!programa) return;
  gl.attachShader(programa, vShader);
  gl.attachShader(programa, fShader);
  gl.linkProgram(programa);
  ok = gl.getProgramParameter(programa, gl.LINK_STATUS);
  if (!ok) console.log(gl.getProgramInfoLog(programa));

  gl.useProgram(programa);

  const aPositionLocation = gl.getAttribLocation(programa, 'aPosicion');
  const aTexCoordLocation = gl.getAttribLocation(programa, 'aTexCoord');

  const columnas = 6;
  const filas = 4;
  const numCuadros = columnas * filas;
  const anchoImg = 4251;
  const altoImg = 2000;
  const anchoFotograma = anchoImg / columnas;
  const altoFotograma = altoImg / filas;
  lienzo.width = anchoFotograma;
  lienzo.height = altoFotograma;
  console.log(anchoFotograma, altoFotograma);

  const verticesFotograma = [-1, -1, 1, -1, -1, 1, 1, 1];
  const vertPositions: number[] = [];

  for (let i = 0; i < numCuadros; i++) vertPositions.push(...verticesFotograma);

  const vertPosVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPositions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPositionLocation);

  function crearCoordenadasTextura() {
    const coordenadas = [];

    for (let y = 0; y < filas; y++) {
      const y1 = y / filas;
      const y2 = (y + 1) / filas;

      for (let x = 0; x < columnas; x++) {
        const x1 = x / columnas;
        const x2 = (x + 1) / columnas;
        coordenadas.push(...[x1, y2, x2, y2, x1, y1, x2, y1]);
      }
    }

    return new Float32Array(coordenadas);
  }

  const texCoordVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordVBO);
  gl.bufferData(gl.ARRAY_BUFFER, crearCoordenadasTextura(), gl.STATIC_DRAW);
  gl.vertexAttribPointer(aTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTexCoordLocation);

  const projMatrix = mat4.create();
  const escala = 100;
  mat4.ortho(projMatrix, 0, escala, 0, escala, escala, -escala);

  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, 0], [0, 0, 0], [0, 0, 0]);

  const projViewMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  const modelMatrix = mat4.create();

  mat4.mul(projViewMatrix, projMatrix, mat4.create());

  const uMvpMatrixLocation = gl.getUniformLocation(programa, 'uMvpMatrix');
  const uSamplerLocation = gl.getUniformLocation(programa, 'uSampler');
  gl.uniform1i(uSamplerLocation, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.93, 0.95, 0.98, 1);

  let currentTime: number;
  let lastTime: number;
  let deltaTime: number;
  let animationTime = 0;
  const velocidadRep = 100;
  let drawingIndex = 0;

  const image = new Image();

  image.onload = () => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    mat4.identity(modelMatrix);
    mat4.translate(modelMatrix, modelMatrix, [50, 50, 0]);
    // mat4.rotateZ(modelMatrix, modelMatrix, 30 * Math. PI / 180);
    mat4.scale(modelMatrix, modelMatrix, [50, 50, 1]);
    mat4.mul(mvpMatrix, projViewMatrix, modelMatrix);
    gl.uniformMatrix4fv(uMvpMatrixLocation, false, mvpMatrix);

    lastTime = Date.now();
    animationLoop();
  };
  image.src = '/diego_6x4-4251x2000_1.webp';

  function animationLoop(): void {
    requestAnimationFrame(animationLoop);

    currentTime = Date.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    animationTime += deltaTime;
    if (animationTime >= velocidadRep) {
      animationTime = 0;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, drawingIndex, 4);

      drawingIndex += 4;
      if (drawingIndex >= 4 * numCuadros) {
        drawingIndex = 0;
      }
    }
  }
}

main();
