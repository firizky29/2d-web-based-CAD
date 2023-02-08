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

// Canvas purposes
const canvas = document.getElementById('gl-canvas');

const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

if(!gl) {
    alert("WebGl isn't available");
}

// Mouse Input
var isDown = false;
canvas.addEventListener('mousedown', (e) => {
    if (!isSelect){
        // New object
        // Input startitng point
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;
        let color = new Color(0,0.45,0.25);
        let vertices = [];

        // Line cuman ada dua vertex
        for(let i = 0; i < 2; i++) {
            vertices.push(new Point(x,y));
            
        }
        objects.push(new Line(gl, vertices, color));
    }
    
    isDown = true;
    console.log(objects);
})

canvas.mouseMoveListener = (e) => {    
    if (isSelect){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

        for (let i = 0;i<objects.length;i++){
            let object = objects[i];
            let min = object.findMin();
            let max = object.findMax();

            if (x >= min.x && x <= max.x && y >= min.y && y <= max.y){
                console.log("object " + i + " selected");
                if (hitboxes.length == 0){
                    hitboxes.push(drawHitbox(min, max))
                }
            }
            else{
                hitboxes.pop();
            }
        }
    }

    // Kalkulasi posisi mouse
    else if (isDown){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

        let objectPoints = objects[objects.length - 1].points;
        objects[objects.length - 1].points = [objectPoints[0], new Point(x,y)];
    }


}



// Mouse Up
canvas.addEventListener('mouseup', (e) => {
    isDown = false;
})

// Selection tool
isSelect = false;
const selectButton = document.getElementById('select-button');
selectButton.selectButton = (e) => {
    console.log("selection tool activated")
    isSelect = true;
}
const shapeButton = document.getElementById('shape-button');
shapeButton.shapeButton = (e) => {
    console.log("selection tool dactivated")
    isSelect = false;
}


// Set ukuran canvas
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

// Setup shaders
const program = initShaders(gl, vertexShaderText, fragmentShaderText);
gl.useProgram(program);
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

    window.requestAnimFrame(render);
}

