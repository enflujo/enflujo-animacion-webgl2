/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param a value to round
 */
export function redondear(a: number) {
  if (a >= 0) return Math.round(a);
  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}

export const aleatorio = Math.random;
export const EPSILON = 0.000001;

function crearEspectro(gl: WebGL2RenderingContext, codigo: string, tipo: number) {
  const espectro = gl.createShader(tipo);

  if (!espectro) throw new Error(`No se pudo crear espectro con código: ${codigo}`);
  gl.shaderSource(espectro, codigo);
  gl.compileShader(espectro);
  const ok = gl.getShaderParameter(espectro, gl.COMPILE_STATUS);
  if (!ok) console.log(gl.getShaderInfoLog(espectro));
  return espectro;
}

export function crearPrograma(gl: WebGL2RenderingContext, espectroV: string, esprectroF: string) {
  const espectroVertices = crearEspectro(gl, espectroV, gl.VERTEX_SHADER);
  const espectroFragmentos = crearEspectro(gl, esprectroF, gl.FRAGMENT_SHADER);
  const programa = gl.createProgram();

  if (!programa) throw new Error('No se pudo crear el programa');
  gl.attachShader(programa, espectroVertices);
  gl.attachShader(programa, espectroFragmentos);
  gl.linkProgram(programa);
  const ok = gl.getProgramParameter(programa, gl.LINK_STATUS);
  if (!ok) console.log(gl.getProgramInfoLog(programa));
  return programa;
}
