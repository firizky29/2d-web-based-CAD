// status
var hoveredShapeId = undefined;
var selectedShapeId = undefined;
var hoveredVertexId = undefined;
var selectedVertexId = undefined;
var relativePosition = [];
var color = new Color(0,0,1,0.5); //make it input from user


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

            const shapeItem = document.getElementById("shape-item-"+selectedShapeId);
            shapeItem.dispatchEvent(new Event("click"));
            updateDetailItemShape(object);
        }         
        // select vertex
        else if (selectedShapeId != undefined){
            let object = objects[selectedShapeId];
            hoveredVertexId = hoverVertex(e, object);
            if (hoveredVertexId != undefined){
                selectedVertexId = hoveredVertexId;
                console.log("selected vertex id: " + selectedVertexId);

                const vertexItem = document.getElementById("vertex-item-"+selectedShapeId + "-" + selectedVertexId);
                vertexItem.dispatchEvent(new Event("click"));
               
                updateDetailItemVertex(object, object.vertices[selectedVertexId]);
                selectedVertices = [drawVertexHitbox(object, selectedVertexId)];
            }
            else if (hoveredShapeId != selectedShapeId){
                selectedShapeId = undefined;
                resetDetailItem();
                resetSelectedLayer();
            }
            else if (hoveredVertexId == undefined){
                selectedVertexId = undefined;
                updateDetailItemShape(object);
                const shapeItem = document.getElementById("shape-item-"+selectedShapeId);
                shapeItem.dispatchEvent(new Event("click"));
            }
        } 

        if(selectedShapeId == undefined){
            console.log("no object selected");
            selectedShapes = [];
            selectedVertices = [];
            selectedShapeId = undefined;
            selectedVertexId = undefined;
            resetDetailItem();
            resetSelectedLayer();
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
                objects.push(new Line(gl, vertices));
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
                objects.push(new Polygon(gl, vertices));
            }

        }
        else if (drawnShape == 'square') {
            if (isDrawingSquare){
                isDrawingSquare = false;
            }
            else{
                isDrawingSquare = true;
                // vertices.push(new Vertex(point, color));
                // vertices.push(new Vertex(new Point(mousePosition.x, mousePosition.y+0.3), color));
                // vertices.push(new Vertex(new Point(mousePosition.x+0.3, mousePosition.y), color));
                // vertices.push(new Vertex(new Point(mousePosition.x+0.3, mousePosition.y+0.3), color));

                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                objects.push(new Square(gl, vertices));
            }
        }

        else if (drawnShape == 'rectangle') {
            if (isDrawingRectangle){
                isDrawingRectangle = false;
            }
            else {
                isDrawingRectangle = true;
                // vertices.push(new Vertex(point, color));
                // vertices.push(new Vertex(new Point(mousePosition.x, mousePosition.y+0.3), color));
                // vertices.push(new Vertex(new Point(mousePosition.x+0.6, mousePosition.y), color));
                // vertices.push(new Vertex(new Point(mousePosition.x+0.6, mousePosition.y+0.3), color));

                // vertices.push(new Vertex(point, new Color(1,0,0)));
                // vertices.push(new Vertex(point, new Color(1,1,1)));
                // vertices.push(new Vertex(point, new Color(0,1,0)));
                // vertices.push(new Vertex(point, new Color(0,0,1)));

                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                vertices.push(new Vertex(point, color));
                objects.push(new Rectangle(gl, vertices));
            }
        }
        updateLayer(objects);
    }
    
    isDown = true;
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
        let firstVertices = object.vertices[0]

        if (drawnShape == 'line' && isDrawing){
            lastVertices.x = mousePosition.x;
            lastVertices.y = mousePosition.y;
        }
        else if (drawnShape == 'polygon' && isDrawingPolygon){
            lastVertices.x = mousePosition.x;
            lastVertices.y = mousePosition.y;
        }
        else if (drawnShape == 'square' && isDrawingSquare){
            object.moveVertex(e, relativePosition, 3);
            relativePosition = [e.clientX, e.clientY];
        }
        else if (drawnShape == 'rectangle' && isDrawingRectangle){
            object.vertices[1].x = firstVertices.x;
            object.vertices[1].y = mousePosition.y;
            object.vertices[2].x = mousePosition.x;
            object.vertices[2].y = firstVertices.y;
            object.vertices[3].x = mousePosition.x;
            object.vertices[3].y = mousePosition.y;   
            object.calculateTheta();          
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
            object.moveVertex(e, relativePosition, selectedVertexId);
            selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
            selectedShapes[0] = drawHitbox(object);
            hitboxes = [];
            relativePosition = [e.clientX, e.clientY];
        } 
        else if (object instanceof Rectangle) {
            object.moveVertex(e, relativePosition, selectedVertexId);
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
    if (isUsingSelectionTools  && isDown && selectedShapeId != undefined){
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

function updateRotation(e) {
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        object.rotate(e.target.value);
        document.getElementById("rotation-value").innerHTML = e.target.value + "<span>&deg</span>";
    }
}
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

function updateX(e){
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        if(selectedVertexId != undefined && object.name !== "Rectangle" && object.name !== "Square"){
            object.vertices[selectedVertexId].translateX(e.target.value);
        } else{
            object.translateX(e.target.value);
        }
    }
    resetHitBox();
}

function updateY(e){
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        if(selectedVertexId != undefined && object.name !== "Rectangle" && object.name !== "Square"){
            object.vertices[selectedVertexId].translateY(e.target.value);
        } else{
            object.translateY(e.target.value);
        }
    }
    resetHitBox();
}

function updateWidth(e){
    if (selectedShapeId != undefined){
        e.target.value = Math.max(1, e.target.value);
        object = objects[selectedShapeId];
        object.stretchX(e.target.value);

        if(object.name === "Square"){
            let heightInput = document.getElementById("height");
            heightInput.value = e.target.value;
            object.stretchY(e.target.value);
        }
    }
    resetHitBox();
}

function updateHeight(e){
    if (selectedShapeId != undefined){
        e.target.value = Math.max(1, e.target.value);
        object = objects[selectedShapeId];
        object.stretchY(e.target.value);
        
        if(object.name === "Square"){
            let widthInput = document.getElementById("width");
            widthInput.value = e.target.value;
            object.stretchX(e.target.value);
        }
    }
    resetHitBox();
}

function updateColor(e){
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        if(selectedVertexId != undefined){
            object.vertices[selectedVertexId].fill(e.target.value);
        } else{
            object.fill(e.target.value);
        }

        const colorHex = document.getElementById("color-hex");
        const rgbColor = hexToRGB(e.target.value);
        colorHex.value = RGBToHex(rgbColor.red, rgbColor.green, rgbColor.blue);
    }
    resetHitBox();
}

function updateColorHex(e){
    if (selectedShapeId != undefined && e.target.value.length == 6 && e.target.value.match(/^[0-9A-F]{6}$/i)){
        object = objects[selectedShapeId];
        if(selectedVertexId != undefined){
            object.vertices[selectedVertexId].fill("#" + e.target.value);
        } else{
            object.fill("#" + e.target.value);
        }
        
        const color = document.getElementById("color");
        color.value = "#" + e.target.value;
    }
    resetHitBox();
}

function updateOpacity(e){
    // e.target.value is a float number concatenated with a character percentage, validate it
    const regex = /^([1-9]|[1-9]\d|100)([,.]\d+)?%?$/;
    
    if (selectedShapeId != undefined && e.target.value.match(regex) != null){
        const [match, numberStr, decimalStr] = e.target.value.match(regex);
        const number = parseFloat(numberStr + (decimalStr || ""));
        const opacity = number / 100;
        object = objects[selectedShapeId];
        e.target.value = number + "%";
        if(selectedVertexId != undefined){
            object.vertices[selectedVertexId].fillOpacity(opacity);
        } else{
            object.fillOpacity(opacity);
        }
    }
    resetHitBox();
}


function updateDilate(e){
    if (selectedShapeId != undefined){
        object = objects[selectedShapeId];
        object.dilate(Math.max(e.target.value, 0.0001)/100);
    }
    resetHitBox();
}

function resetHitBox(){
    if(selectedShapeId != undefined){
        if(selectedVertexId != undefined){
            selectedVertices[0] = drawVertexHitbox(object, selectedVertexId);
        }
        selectedShapes[0] = drawHitbox(object);
        hitboxes = [];
    }
}

function selectShapeItem(e, i){
    resetSelectionTools();
    isUsingDrawTools = false;
    isUsingSelectionTools = true;

    const lastSelected= document.getElementsByClassName("selected")[0];
    if(lastSelected != undefined){
        lastSelected.classList.remove("selected");
    }

    const shapeItem = document.getElementById("shape-item-" + i);
    shapeItem.classList.add("selected");

    selectedShapeId = i;
    selectedVertexId = undefined;
    let object = objects[selectedShapeId];
    selectedShapes = [drawHitbox(object)];
    updateDetailItemShape(object);
}

function selectVertexItem(e, i, j){
    resetSelectionTools();
    isUsingDrawTools = false;
    isUsingSelectionTools = true;
    
    const lastSelected = document.getElementsByClassName("selected")[0];
    if(lastSelected!= undefined){
        lastSelected.classList.remove("selected");
    }

    const vertexItem = document.getElementById("vertex-item-"+ i + '-' + j);
    vertexItem.classList.add("selected");

    selectedShapeId = i;
    selectedVertexId = j;
    let object = objects[selectedShapeId];
    selectedVertices = [drawVertexHitbox(object, selectedVertexId)];
    selectedShapes = [drawHitbox(object)];
    updateDetailItemVertex(object, object.vertices[selectedVertexId]);
}

function resetSelectedLayer(){
    const lastSelected = document.getElementsByClassName("selected")[0];
    if(lastSelected != undefined){
        lastSelected.classList.remove("selected");
    }
}







