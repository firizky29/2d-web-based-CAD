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
var hoveredShapeId = undefined;
var selectedShapeId = undefined;
var hoeveredVertexId = undefined;
var selectedVertexId = undefined;
var relativePosition = [];
var color = new Color(0.75,0.25,0.35); //make it input from user

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
    if (isSelect){
        hoveredShapeId = hoverObject(e, objects);
        if (hoveredShapeId != undefined && hoveredShapeId != selectedShapeId){
            // add hitbox and update selected shape id
            selectedShapeId = hoveredShapeId;
            let object = objects[selectedShapeId];
            selectedShapes = [drawHitbox(object)];
            console.log("selected shape id: " + selectedShapeId);
    
            //update length to screen
            document.getElementById("line-length").value = object.length;
    
            // console.log(object)
            // console.log(object.length);
        }
        else if (hoveredShapeId != undefined && hoveredShapeId == selectedShapeId){
            // select vertex
            let object = objects[selectedShapeId];
            hoeveredVertexId = hoverVertex(e, object);
            if (hoeveredVertexId != undefined){
                selectedVertexId = hoeveredVertexId;
                console.log("selected vertex id: " + selectedVertexId);
            }
            else{
                selectedVertexId = undefined;
            }
        }
        else if(hoveredShapeId == undefined){
            console.log("no object selected");
            selectedShapes = [];
            selectedShapeId = undefined;
            selectedVertexId = undefined;
        }
    }


    // Drawing tool
    if (!isSelect){
        // New object
        // Input startitng point
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;
        let vertices = [];

        // Menggambar line
        if (lineShape){
            for(let i = 0; i < 2; i++) {
                let point = new Point(x, y);
                vertices.push(new Vertex(point, color));
                
            }
            objects.push(new Line(gl, vertices, color));
        }
    }
    
    isDown = true;
    relativePosition = [e.clientX, e.clientY]
    // console.log(relativePosition)
    console.log(objects);
})

canvas.mouseMoveListener = (e) => { 
    // Moving tool vertex
    if (isSelect && isDown && selectedShapeId == hoveredShapeId && selectedVertexId != undefined){
        let object = objects[selectedShapeId];
        object.moveVertex(e, relativePosition, selectedVertexId);
        relativePosition = [e.clientX, e.clientY];
    }

    // Moving tool shape
    else if (isSelect  && isDown && selectedShapeId != undefined){
        let object = objects[selectedShapeId];
        object.moveShape(e, relativePosition);
        selectedShapes[0] = drawHitbox(object);
        hitboxes = [];
        relativePosition = [e.clientX, e.clientY];
    }


    // Selecting vertex
    else if (isSelect && selectedShapeId != undefined){
        let object = objects[selectedShapeId];
        hoeveredVertexId = hoverVertex(e, object);
    }
    // Selection tool   
    else if (isSelect){
        hoveredShapeId = hoverObject(e, objects)

        // if hitboxes is empty and hoveredshape is defines
        if (hitboxes.length == 0 && hoveredShapeId != undefined){
            hitboxes.push(drawHitbox(objects[hoveredShapeId]));
        }
        else if (hoveredShapeId == undefined){
            hitboxes = [];   
        }
    }

    // Drawing tool
    else if (isDown){
        // update vertex
        let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
        let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

        if (lineShape){
            let objectStartVertex = objects[objects.length - 1].vertices[0];
            let objectStartPoint = new Point(objectStartVertex.x, objectStartVertex.y);
            objects[objects.length-1].setPoints([objectStartPoint, new Point(x,y)]);
        }
    }
}

/* APPS */
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

    hitboxes = []
    selectedShapes = []
    selectedShapeId = undefined;
    selectedVertexId = undefined;
}
// change length on input
const lengthInput = document.getElementById('line-length');
document.getElementById("line-length").addEventListener("keyup", updateLength);
function updateLength() {
    length = document.getElementById("line-length").value;
    object = objects[selectedShapeId];
    object.setNewLength(lengthInput.value);
}
// slider rotation input
const rotationSlider = document.getElementById('rotation-slider');
document.getElementById("rotation-slider").addEventListener("input", updateRotation);
function updateRotation() {
    rotation = document.getElementById("rotation-slider").value;
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        object.rotate(rotation);
    }
}
// input color
const colorInput = document.getElementById('vertex-color');
document.getElementById("vertex-color").addEventListener("input", updateColor);
function updateColor() {
    color = hexToRGB(document.getElementById("vertex-color").value);
    if (selectedVertexId != undefined){
        object = objects[selectedShapeId];
        object.updateColor(selectedVertexId, color);
    }
}

/* */



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

    for (let selectedShape of selectedShapes) {
        selectedShape.draw();
    }

    window.requestAnimFrame(render);
}

