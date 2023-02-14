// status
var hoveredShapeId = undefined;
var selectedShapeId = undefined;
var hoveredVertexId = undefined;
var selectedVertexId = undefined;
var relativePosition = [];
var color = new Color(0.85,0.85,0.85); //make it input from user

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
            selectedVertexId = undefined;
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
            if (hoveredVertexId != undefined){
                selectedVertexId = hoveredVertexId;
                console.log("selected vertex id: " + selectedVertexId);
                selectedVertices = [drawVertexHitbox(object, selectedVertexId)];
            }
            else if (hoveredShapeId != selectedShapeId){
                // deselect shape
                selectedShapeId = undefined;
            }
            else if (hoveredVertexId == undefined){
                // deselect vertex
                selectedVertexId = undefined;
            }
        }
        
        if(selectedShapeId == undefined){
            console.log("no object selected");
            selectedShapes = [];
            selectedVertices = [];
            selectedShapeId = undefined;
            selectedVertexId = undefined;
        }

        if(selectedVertexId == undefined){
            // console.log("no vertex selected");
            selectedVertices = [];
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
                object = objects[objects.length-1];
                object.calculateDistance();
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
        else if (drawnShape == 'square') {
            if (isDrawingSquare){
                isDrawingSquare = false;
            }
            else{
                isDrawingSquare = true;
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(new Point(mousePosition.x, mousePosition.y+0.3), color));
                vertices.push(new Vertex(new Point(mousePosition.x+0.3, mousePosition.y), color));
                vertices.push(new Vertex(new Point(mousePosition.x+0.3, mousePosition.y+0.3), color));
                objects.push(new Square(gl, vertices, color));
            }
        }
        else if (drawnShape == 'rectangle') {
            if (isDrawingRectangle){
                isDrawingRectangle = false;
            }
            else {
                isDrawingRectangle = true;
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(new Point(mousePosition.x, mousePosition.y+0.3), color));
                vertices.push(new Vertex(new Point(mousePosition.x+0.6, mousePosition.y), color));
                vertices.push(new Vertex(new Point(mousePosition.x+0.6, mousePosition.y+0.3), color));
                objects.push(new Rectangle(gl, vertices, color));
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
        // else if (drawnShape == 'square' && isDrawingSquare){
        //     lastVertices.x = mousePosition.x;
        //     lastVertices.y = mousePosition.y;
        // }
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
        if (object instanceof Square) {
            object.resizeSquare(e, relativePosition, selectedVertexId);
            selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
            selectedShapes[0] = drawHitbox(object);
            hitboxes = [];
            relativePosition = [e.clientX, e.clientY];
        } 
        else if (object instanceof Rectangle) {
            object.resizeRectangle(e, relativePosition, selectedVertexId);
            selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
            selectedShapes[0] = drawHitbox(object);
            hitboxes = [];
            relativePosition = [e.clientX, e.clientY];
        }
        else {
            object.moveVertex(e, relativePosition, selectedVertexId);
            selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
            selectedShapes[0] = drawHitbox(object);
            hitboxes = [];
            relativePosition = [e.clientX, e.clientY];
        }
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
isUsingSelectionTools = true;
isUsingDrawTools = false;
drawnShape = 'line';
isDrawingPolygon = false;
isDrawing = false;
isDrawingSquare = false;
isDrawingRectangle = false;

// SELECT BUTTON
const selectButton = document.getElementById('select-button');
selectButton.selectButton = (e) => {
    console.log("selection tool activated")
    isUsingSelectionTools = true;
    isUsingDrawTools = false;

    let navbarActive = document.getElementsByClassName("active")[0];
    navbarActive.classList.remove("active");

    selectButton.classList.add("active");
    
}

// TOOLS
// Line Tool
const lineShapeButton = document.getElementById('line-shape');
lineShapeButton.lineShape = (e) => {
    console.log("line tool activated")
    drawnShape = "line";
    resetSelectionTools();

    let navbarActive = document.getElementsByClassName("active")[0];
    navbarActive.classList.remove("active");

    lineShapeButton.classList.add("active");
}
// // Change Length on Line
// const lengthInput = document.getElementById('line-length');
// document.getElementById("line-length").addEventListener("keyup", updateLength);
// function updateLength() {
//     length = document.getElementById("line-length").value;
//     object = objects[selectedShapeId];
//     object.setNewLength(lengthInput.value);
//     selectedShapes[0] = drawHitbox(object);
// }


// square tool
const squareShapeButton = document.getElementById('square-shape');
squareShapeButton.squareShape = (e) => {
    console.log("square tool activated")
    drawnShape = "square";
    resetSelectionTools();

    let navbarActive = document.getElementsByClassName("active")[0];
    navbarActive.classList.remove("active");
    

    squareShapeButton.classList.add("active");

}

// rectangle tool
const rectangleShapeButton = document.getElementById('rectangle-shape');
rectangleShapeButton.rectangleShape = (e) => {
    console.log("rectangle tool activated")
    drawnShape = "rectangle";
    resetSelectionTools();

    let navbarActive = document.getElementsByClassName("active")[0];
    navbarActive.classList.remove("active");


    rectangleShapeButton.classList.add("active");

}


// Polygon Tool
const polygonShapeButton = document.getElementById('polygon-shape');
polygonShapeButton.polygonShape = (e) => {
    console.log("polygon tool activated")
    drawnShape = "polygon";
    resetSelectionTools();

    let navbarActive = document.getElementsByClassName("active")[0];
    navbarActive.classList.remove("active");
    polygonShapeButton.classList.add("active");

}

// Delete Vertex on Polygon
// const deletePolygonVertexButton = document.getElementById('deletePolygonVertex');
// deletePolygonVertexButton.deletePolygonVertex = (e) => {
//     console.log("deleting polygon vertex");
//     if (selectedVertexId != undefined){
//         object = objects[selectedShapeId];
//         object.deleteVertex(selectedVertexId);
//         updateDeletedObject(objects);
//     }
// }

// GENERAL TOOLS
// Rotation Tool
// const rotationSlider = document.getElementById('rotation-slider');
// document.getElementById("rotation-slider").addEventListener("input", updateRotation);
// function updateRotation() {
//     rotation = document.getElementById("rotation-slider").value;
//     if (selectedShapeId != undefined){
//         object = objects[selectedShapeId];
//         object.rotate(rotation);
//     }
// }
// // Color Tool
// const colorInput = document.getElementById('vertex-color');
// document.getElementById("vertex-color").addEventListener("input", updateColor);
// function updateColor() {
//     color = hexToRGB(document.getElementById("vertex-color").value);
//     if (selectedVertexId != undefined){
//         object = objects[selectedShapeId];
//         object.updateColor(selectedVertexId, color);
//     }
// }

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
function updateDeletedObject(objects){
    // delete obect if vertices == 0
    if (objects[selectedShapeId].vertices.length <= 2){
        if (objects.length == 1){
            objects.pop()
        }else{
            objects.slice(selectedShapeId,1);
        }

        hitboxes = [];
        selectedShapes = [];
        selectedVertices = [];
        selectedShapeId = undefined;
        selectedVertexId = undefined;
    }else{
        selectedShapes[0] = drawHitbox(object);
        selectedVertices = [];
    }
}



// main menu tools
mainMenuActive = false;
const mainMenuButton = document.getElementById('main-menu-button');
const mainMenuItems = document.getElementById('mainmenu');
const dropdownIcon = document.getElementById('dropdown-icon');
mainMenuButton.mainMenuButton = (e) => {
    console.log("main menu tool activated")
    if(!mainMenuActive){
        resetSelectionTools();
        isUsingDrawTools = false;

        let navbarActive = document.getElementsByClassName("active")[0];
        navbarActive.classList.remove("active");
        mainMenuButton.classList.add("active");
        dropdownIcon.style.marginTop = "5px";
        mainMenuActive = true;
        mainMenuItems.style.display = "block";
    } else{
        dropdownIcon.style.marginTop = "0px";
        mainMenuActive = false;
        mainMenuItems.style.display = "none";
        selectButton.dispatchEvent(new Event('click'));
    }
}

mainMenuButton.mainMenuHovered = (e) => {
    if(!mainMenuActive){
        dropdownIcon.style.marginTop = "5px";
    }
        
}

mainMenuButton.mainMenuUnhovered = (e) => {
    if(!mainMenuActive){
        dropdownIcon.style.marginTop = "0px";
    }
}

// new design
const newDesign = document.getElementById('new-design');
newDesign.newDesign = (e) => {
    window.location.reload();
}


// export design
const exportDesign = document.getElementById('export-design');
exportDesign.saveDesign = (e) => {
    let design = JSON.stringify(objects);
    console.log(design);
}





document.body.addEventListener('click', (e) => {
    if(!e.target.closest('.tools')){
        if (mainMenuActive){
            dropdownIcon.style.marginTop = "0px";
            mainMenuActive = false;
            mainMenuItems.style.display = "none";
            selectButton.dispatchEvent(new Event('click'));
        }
    } else{
        if(!e.target.closest('#main-menu-button')){
            if (mainMenuActive){
                dropdownIcon.style.marginTop = "0px";
                mainMenuItems.style.display = "none";
                mainMenuActive = false;
            }
        }
    }
});




