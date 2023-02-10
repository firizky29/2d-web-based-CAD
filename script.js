// status
var hoveredShapeId = undefined;
var selectedShapeId = undefined;
var hoveredVertexId = undefined;
var selectedVertexId = undefined;
var relativePosition = [];
var color = new Color(0.75,0.25,0.35); //make it input from user

/* MOUSE INPUT */
var isDown = false;
canvas.addEventListener('mousedown', (e) => {
    /* SELECTING OBJECTS */
    // Selection tool
    if (isUsingSelectionTools){
        // select shapes
        hoveredShapeId = hoverObject(e, objects);
        if (hoveredShapeId != undefined && hoveredShapeId != selectedShapeId){
            // add hitbox and update selected shape id
            selectedShapeId = hoveredShapeId;
            let object = objects[selectedShapeId];
            selectedShapes = [drawHitbox(object)];
            console.log("selected shape id: " + selectedShapeId);
    
            //update length to screen
            document.getElementById("line-length").value = object.length;
        }

        // select vertex
        else if (selectedShapeId != undefined){
            let object = objects[selectedShapeId];
            hoveredVertexId = hoverVertex(e, object);
            console.log(hoveredVertexId)
            if (hoveredVertexId != undefined){
                selectedVertexId = hoveredVertexId;
                console.log("selected vertex id: " + selectedVertexId);
                selectedVertices = [drawVertexHitbox(object, selectedVertexId)];
            }
            else{
                selectedShapeId = undefined;
            }
        }
        
        if(selectedShapeId == undefined){
            console.log("no object selected");
            selectedShapes = [];
            selectedVertices = [];
            selectedShapeId = undefined;
            selectedVertexId = undefined;
        }
    }


    /* DRAWING OBJECTS */
    if (isUsingDrawTools){
        // New object
        // Input startitng point
        let mousePosition = getMousePosition(e);
        let point = new Point(mousePosition.x, mousePosition.y);
        let vertices = [];

        // Menggambar line
        if (drawnShape == 'line'){
            console.log("Drawing line");
            if (isDrawing){
                isDrawing = false;
            }
            else{
                isDrawing = true;
                for(let i = 0; i < 2; i++) {
                    vertices.push(new Vertex(point, color));
                }
                objects.push(new Line(gl, vertices, color));
            }
        }
        else if (drawnShape == 'polygon'){
            if (e.button == 2){
                isDrawingPolygon = false;
                object = objects[objects.length-1];
                vertices = object.vertices;
                vertices.pop();                
                return;
            }

            console.log("Drawing polyon")
            if(isDrawingPolygon){
                object = objects[objects.length-1];
                vertices = object.vertices;
                vertices.push(new Vertex(point, color));
                // console.log(vertices)
            }else{
                isDrawingPolygon = true; 
                for(let i = 0; i < 2; i++) {
                    vertices.push(new Vertex(point, color));
                }
                objects.push(new Polygon(gl, vertices, color));
            }

        }
    }
    
    isDown = true;
    // records the position of the mouse on click
    relativePosition = [e.clientX, e.clientY]
    console.log(objects);
})

canvas.mouseMoveListener = (e) => { 
    /* DRAWING OBJECTS */
    // Drawing tool
    if (isUsingDrawTools){
        // update vertex
        let mousePosition = getMousePosition(e);
        let object = objects[objects.length-1]
        let lastVertices = object.vertices[object.vertices.length-1]

        if (drawnShape == 'line' && isDrawing){
            lastVertices.x = mousePosition.x;
            lastVertices.y = mousePosition.y;
        }
        else if (drawnShape == 'polygon' && isDrawingPolygon){
            lastVertices.x = mousePosition.x;
            lastVertices.y = mousePosition.y;
        }
    }

    /* HOVERING OBJECTS */
    // Selecting vertex
    if (isUsingSelectionTools && selectedShapeId != undefined){
        let object = objects[selectedShapeId];
        hoveredVertexId = hoverVertex(e, object);
        if (hoveredVertexId != undefined){
            hitboxes.push(drawVertexHitbox(object, hoveredVertexId));
        }  
        else{
            hitboxes = [];
        }
    }
    // Selection tool   
    else if (isUsingSelectionTools){
        hoveredShapeId = hoverObject(e, objects)

        // if hitboxes is empty and hoveredshape is defines
        if (hitboxes.length == 0 && hoveredShapeId != undefined){
            hitboxes.push(drawHitbox(objects[hoveredShapeId]));
        }
        else if (hoveredShapeId == undefined){
            hitboxes = [];   
        }
    }

    /* MOVING OBJECTS */
    // Moving tool vertex
    if (isUsingSelectionTools && isDown && selectedShapeId != undefined && selectedVertexId != undefined){
        let object = objects[selectedShapeId];
        object.moveVertex(e, relativePosition, selectedVertexId);
        selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
        selectedShapes[0] = drawHitbox(object);
        hitboxes = [];
        relativePosition = [e.clientX, e.clientY];
    }

    // Moving tool shape
    else if (isUsingSelectionTools  && isDown && selectedShapeId != undefined){
        let object = objects[selectedShapeId];
        object.moveShape(e, relativePosition);
        selectedShapes[0] = drawHitbox(object);
        hitboxes = [];
        relativePosition = [e.clientX, e.clientY];
    }
}
// Mouse Up
canvas.addEventListener('mouseup', (e) => {
    isDown = false;
})

/* APPS */
// Buttons
isUsingSelectionTools = false;
isUsingDrawTools = true;
drawnShape = 'line';
isDrawingPolygon = false;
isDrawing = false;

// SELECT BUTTON
const selectButton = document.getElementById('select-button');
selectButton.selectButton = (e) => {
    console.log("selection tool activated")
    isUsingSelectionTools = true;
    isUsingDrawTools = false;
}

// TOOLS
// Line Tool
const lineShapeButton = document.getElementById('line-shape');
lineShapeButton.lineShape = () => {
    console.log("line tool activated")
    drawnShape = "line";
    resetSelectionTools();
}
// Change Length on Line
const lengthInput = document.getElementById('line-length');
document.getElementById("line-length").addEventListener("keyup", updateLength);
function updateLength() {
    length = document.getElementById("line-length").value;
    object = objects[selectedShapeId];
    object.setNewLength(lengthInput.value);
    selectedShapes[0] = drawHitbox(object);
}

// Polygon Tool
const polygonShapeButton = document.getElementById('polygon-shape');
polygonShapeButton.polygonShape = () => {
    console.log("polygon tool activated")
    drawnShape = "polygon";
    resetSelectionTools();
}
// Delete Vertex on Polygon
const deletePolygonVertexButton = document.getElementById('deletePolygonVertex');
deletePolygonVertexButton.deletePolygonVertex = () => {
    console.log("deleting polygon vertex");
    if (selectedVertexId != undefined){
        object = objects[selectedShapeId];
        object.deleteVertex(selectedVertexId);
        updateDeletedObject(objects, selectedShapeId);
    }
}

// GENERAL TOOLS
// Rotation Tool
const rotationSlider = document.getElementById('rotation-slider');
document.getElementById("rotation-slider").addEventListener("input", updateRotation);
function updateRotation() {
    rotation = document.getElementById("rotation-slider").value;
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        object.rotate(rotation);
    }
}
// Color Tool
const colorInput = document.getElementById('vertex-color');
document.getElementById("vertex-color").addEventListener("input", updateColor);
function updateColor() {
    color = hexToRGB(document.getElementById("vertex-color").value);
    if (selectedVertexId != undefined){
        object = objects[selectedShapeId];
        object.updateColor(selectedVertexId, color);
    }
}

// UTILS
// Reset Selection Variables
function resetSelectionTools(){
    console.log("selection tool deactivated")
    isUsingSelectionTools = false;
    isUsingDrawTools = true;

    hitboxes = []
    selectedShapes = []
    selectedVertices = []
    selectedShapeId = undefined;
    selectedVertexId = undefined;
}
// Update Deleted Object
function updateDeletedObject(objects, selectedShapeId){
    // delete obect if vertices == 0
    if (objects[selectedShapeId].vertices.length == 0){
        objects.slice(selectedShapeId,1);
        hitboxes = [];
        selectedShapes = [];
        selectedVertices = [];
    }else{
        selectedShapes[0] = drawHitbox(object);
        selectedVertices = [];
    }
}