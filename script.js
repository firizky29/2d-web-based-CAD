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
var hoveredShapeId = 0;
var selectedShapeId = 0;

// Canvas purposes
const canvas = document.getElementById('gl-canvas');

const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

if(!gl) {
    alert("WebGl isn't available");
}

// Mouse Input
var isDown = false;
canvas.addEventListener('mousedown', (e) => {
    // Selection tool
    if (hitboxes.length != 0){
        selectedShapeId = hoveredShapeId;
        console.log("selected shape id: " + selectedShapeId);
        //update length to screen
        let object = objects[selectedShapeId];
        document.getElementById("line-length").value = object.length;
        
        // console.log(object)
        // console.log(object.length);
    }

    // Drawing tool
    if (!isSelect){
        // New object
        // Input startitng point
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;
        let color = new Color(0,0.45,0.25);
        let vertices = [];

        // Menggambar line
        if (lineShape){
            for(let i = 0; i < 2; i++) {
                vertices.push(new Point(x,y));
                
            }
            objects.push(new Line(gl, vertices, color));
        }
    }
    
    isDown = true;
    console.log(objects);
})

canvas.mouseMoveListener = (e) => { 
    // Selection tool   
    if (isSelect){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;
        let min, max, object;

        for (let i = 0;i<objects.length;i++){
            if (hitboxes.length == 0){
                object = objects[i];
            }
            else{
                object = objects[hoveredShapeId];
            }

            min = object.findMin();
            max = object.findMax();

            if (x >= min.x && x <= max.x && y >= min.y && y <= max.y){
                // console.log("object " + i + " selected");
                if (hitboxes.length == 0){
                    hoveredShapeId = i;
                    hitboxes.push(drawHitbox(min, max))
                }
            }
            else{
                hitboxes.pop();
            }
        }
        // console.log(hitboxes)
    }

    // Drawing tool
    else if (isDown){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

        if (lineShape){
            let objectPoints = objects[objects.length - 1].points;
            objects[objects.length - 1].setPoints( [objectPoints[0], new Point(x,y)]);
        }
    }
}

// Mouse Up
canvas.addEventListener('mouseup', (e) => {
    isDown = false;
})

// Buttons
isSelect = false;
lineShape = true;
const selectButton = document.getElementById('select-button');
selectButton.selectButton = (e) => {
    console.log("selection tool activated")
    isSelect = true;
    lineShape = false;
}
const shapeButton = document.getElementById('line-shape');
shapeButton.lineShape = (e) => {
    console.log("selection tool deactivated")
    console.log("using line tool")
    isSelect = false;
    lineShape = true;
}

// change length on input
const lengthInput = document.getElementById('line-length');
document.getElementById("line-length").addEventListener("keyup", updateLength);
function updateLength() {
    length = document.getElementById("line-length").value;
    object = objects[selectedShapeId];
    object.setNewLength(lengthInput.value);
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

