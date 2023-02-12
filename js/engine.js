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

// create array of shape
var objects = [];
var hitboxes = [];
var selectedShapes = [];
var selectedVertices = [];


// Canvas purposes
const canvas = document.getElementById('gl-canvas');
const canvasContainer = document.getElementById('canvas-container');

canvas.width  = 900;
canvas.height = 800; 

const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

if(!gl) {
    alert("WebGl isn't available");
}

// Set ukuran canvas
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(1.0, 1.0, 1.0, 1.0);

// Setup shaders
const program = initShaders(gl, vertexShaderText, fragmentShaderText);
// gl.useProgram(program);
render();

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 

    //get attribute location
    let positionAttLoc = gl.getAttribLocation(program, "vertPosition");
    let colorAttLoc = gl.getAttribLocation(program, "vertColor");

    // tell WebGL how to read raw data
    gl.vertexAttribPointer(
        positionAttLoc, //Attribute location
        2, // number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttLoc, //Attribute location
        3, // number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttLoc);
    gl.enableVertexAttribArray(colorAttLoc);

    gl.useProgram(program);

    
    for (let object of objects) {
        object.draw();
    }

    for (let hitbox of hitboxes) {
        hitbox.draw();
    }

    for (let selectedShape of selectedShapes) {
        selectedShape.draw();
    }

    for (let selectedVertex of selectedVertices) {
        selectedVertex.draw();
    }

    window.requestAnimFrame(render);
}