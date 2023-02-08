const vertexShaderText = `
    attribute vec4 vertPosition;
    attribute vec4 vertColor;
    varying vec4 fragColor;

    void main() {
        gl_Position = vertPosition;
        fragColor = vertColor;
    }
`;

const fragmentShaderText = `
    precision mediump float;
    varying vec4 fragColor;

    void main() {
        gl_FragColor = fragColor;
    }
`;

var vertices = [];
var colors = [];

// Canvas purposes
const canvas = document.getElementById('gl-canvas');

const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

if(!gl) {
    alert("WebGl isn't available");
}

// Mouse Input
var isDown = false;
canvas.addEventListener('mousedown', (e) => {
    // Input startitng point
    let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
    let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

    // Line cuman ada dua vertex
    for(let i = 0; i < 2; i++) {
        vertices.push([x,y]);
        colors.push([0,0,0,1]);
    }
    isDown = true;

    console.log(vertices);
    console.log(x,y)
})

canvas.mouseMoveListener = (e) => {
    // Kalkulasi posisi mouse
    if (isDown){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

        vertices[vertices.length - 1] = [x,y];
        // colors[colors.length - 1] = [0,0,0,1];
    }

}

// Mouse Up
canvas.addEventListener('mouseup', (e) => {
    isDown = false;
})

// Set ukuran canvas
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

// Setup shaders
const program = initShaders(gl, vertexShaderText, fragmentShaderText);
gl.useProgram(program);
render();

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex Rendering
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);

    const vertPosition = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(vertPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertPosition);

    // Color Rendering
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors.flat()), gl.STATIC_DRAW);

    const vertColor = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(vertColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertColor);

    for(let i=0; i < vertices.length; i+=2) {
        gl.drawArrays(gl.LINES, i, 2);
    }

    window.requestAnimFrame(render);
}