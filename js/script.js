// status
var hoveredShapeId = undefined;
var selectedShapeId = undefined;
var hoveredVertexId = undefined;
var selectedVertexId = undefined;
var relativePosition = [];
var color = new Color(0,0,0,0.5); //make it input from user


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
            updateDetailItemShape(object);
        } else if (selectedShapeId != undefined){
            let object = objects[selectedShapeId];
            hoveredVertexId = hoverVertex(e, object);
            if (hoveredVertexId != undefined){
                selectedVertexId = hoveredVertexId;
                console.log("selected vertex id: " + selectedVertexId);
                selectedVertices = [drawVertexHitbox(object, selectedVertexId)];
                updateDetailItemVertex(object, object.vertices[selectedVertexId]);
            }
            else if (hoveredShapeId != selectedShapeId){
                selectedShapeId = undefined;
            }
            else if (hoveredVertexId == undefined){
                selectedVertexId = undefined;
                updateDetailItemShape(object);
            }
        } else{
            console.log("no object selected");
            selectedShapes = [];
            selectedVertices = [];
            selectedShapeId = undefined;
            selectedVertexId = undefined;
            resetDetailItem();
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
            if(isDrawingPolygon){
                object = objects[objects.length-1];
                vertices = object.vertices;
                vertices.push(new Vertex(point, color));
            } else{
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
                let mousePosition1 = getMousePositionOnCanvas(e.clientX, e.clientY+200);
                let mousePosition2 = getMousePositionOnCanvas(e.clientX+200, e.clientY);
                let mousePosition3 = getMousePositionOnCanvas(e.clientX+200, e.clientY+200);

                vertices.push(new Vertex(new Point(mousePosition1.x, mousePosition1.y), color));
                vertices.push(new Vertex(new Point(mousePosition2.x, mousePosition2.y), color));
                vertices.push(new Vertex(new Point(mousePosition3.x, mousePosition3.y), color));
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
                let mousePosition1 = getMousePositionOnCanvas(e.clientX, e.clientY+150);
                let mousePosition2 = getMousePositionOnCanvas(e.clientX+300, e.clientY);
                let mousePosition3 = getMousePositionOnCanvas(e.clientX+300, e.clientY+150);

                vertices.push(new Vertex(new Point(mousePosition1.x, mousePosition1.y), color));
                vertices.push(new Vertex(new Point(mousePosition2.x, mousePosition2.y), color));
                vertices.push(new Vertex(new Point(mousePosition3.x, mousePosition3.y), color));
                objects.push(new Rectangle(gl, vertices, color));
            }
        }
        updateLayer(objects);
    }
    
    isDown = true;
    relativePosition = [e.clientX, e.clientY]
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

        updateDetailItemVertex(object, object.vertices[selectedVertexId]);
    }

    // Moving tool shape
    else if (isUsingSelectionTools  && isDown && selectedShapeId != undefined){
        let object = objects[selectedShapeId];
        object.moveShape(e, relativePosition);
        selectedShapes[0] = drawHitbox(object);
        hitboxes = [];
        relativePosition = [e.clientX, e.clientY];
        updateDetailItemShape(object);
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
    resetDetailItem();
}
// Update Deleted Object
function updateDeletedObject(objects){
    // delete obect if vertices == 0
    if (objects[selectedShapeId].vertices.length <= 2){
        if (objects.length == 1){
            objects.pop()
        }else{
            objects.splice(selectedShapeId, 1);
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
    updateLayer(objects);
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


function clickedDeleteContainer(e){
    let deleteButtonContainer = document.getElementById("delete-button-container");
    let deleteItemContainer = document.getElementById("delete-item-container");
    if(deleteItemContainer.classList.contains("clicked")){
        deleteButtonContainer.style.display = "none";
        deleteItemContainer.classList.remove("clicked");
    } else{
        deleteButtonContainer.style.display = "block";
        deleteItemContainer.classList.add("clicked");
    }
}

function clickedDeleteItem(e){
    let deleteButtonContainer = document.getElementById("delete-button-container");
    let deleteItemContainer = document.getElementById("delete-item-container");
    deleteButtonContainer.style.display = "none";
    deleteItemContainer.classList.remove("clicked");
    console.log("delete item clicked", selectedShapeId, selectedVertexId);
    if (selectedVertexId != undefined){
        object = objects[selectedShapeId];
        object.deleteVertex(selectedVertexId);
        updateDeletedObject(objects);
    } else if (selectedShapeId != undefined){
        if(objects.length == 1){
            objects.pop()
        }else{
            objects.splice(selectedShapeId, 1);
        }

        hitboxes = [];
        selectedShapes = [];
        selectedVertices = [];
        selectedShapeId = undefined;
        selectedVertexId = undefined;
        updateLayer(objects);
        resetDetailItem();
    }
}






