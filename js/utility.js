const euclideanDistance = (A, B) => {
    return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
};

const norm = (deg) => {
    return ((((deg + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
};

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return -1;
    }
    return shader;
}

function initShaders(gl, vertextSource, fragmentSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertextSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    return program;
}

window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

function drawHitbox(object) {
    let point1 = object.findMin();
    let point2 = object.findMax();
    const color = new Color(0.45, 0.55, 1, 1);

    const hitBoxPoints = [
        new Point(point1.x, point1.y),
        new Point(point1.x, point2.y),
        new Point(point2.x, point2.y),
        new Point(point2.x, point1.y)
    ];

    const hitBoxVertices = [
        new Vertex(hitBoxPoints[0], color),
        new Vertex(hitBoxPoints[1], color),
        new Vertex(hitBoxPoints[2], color),
        new Vertex(hitBoxPoints[3], color)
    ];

    let hitbox = new Hitbox(gl, hitBoxVertices, color);
    // console.log(hitbox)
    return hitbox;
}

function drawVertexHitbox(object, selectedVertexId) {
    let vertex = object.vertices[selectedVertexId];
    let radius = 20 / canvas.offsetWidth;
    const color = new Color(0.95, 0.55, 0.25, 1);

    const hitBoxPoints = [
        new Point(vertex.x - radius, vertex.y - radius),
        new Point(vertex.x - radius, vertex.y + radius),
        new Point(vertex.x + radius, vertex.y + radius),
        new Point(vertex.x + radius, vertex.y - radius)
    ];

    const hitBoxVertices = [
        new Vertex(hitBoxPoints[0], color),
        new Vertex(hitBoxPoints[1], color),
        new Vertex(hitBoxPoints[3], color),
        new Vertex(hitBoxPoints[2], color)
    ];

    let hitbox = new Rectangle(gl, hitBoxVertices, color);
    // console.log(hitbox)
    return hitbox;
}


function hoverObject(e, objects) {
    let mousePosition = getMousePosition(e);
    let min, max, object;

    for (let i = 0; i < objects.length; i++) {
        object = objects[i];

        min = object.findMin();
        max = object.findMax();

        if (mousePosition.x >= min.x && mousePosition.x <= max.x && mousePosition.y >= min.y && mousePosition.y <= max.y) {
            // object selected
            return i;
        }
        else {
            // no object selected
        }
    }
}

function hoverVertex(e, object) {
    let mousePosition = getMousePosition(e);
    let min, max, vertex;
    let radius = 20 / canvas.offsetWidth;

    for (let i = 0; i < object.vertices.length; i++) {
        vertex = object.vertices[i];

        min = new Point(vertex.x - radius, vertex.y - radius);
        max = new Point(vertex.x + radius, vertex.y + radius);

        if (mousePosition.x >= min.x && mousePosition.x <= max.x && mousePosition.y >= min.y && mousePosition.y <= max.y) {
            // vertex selected
            return i;
        }
        else {
            // no vertex selected
        }
    }
}

function hexToDec(hex) {
    return parseInt(hex, 16);
}

function hexToRGB(hexColor) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    const r = hexToDec(result[1]);
    const g = hexToDec(result[2]);
    const b = hexToDec(result[3]);

    return new Color(r / 255, g / 255, b / 255, 1);
}

function getMousePosition(e) {
    let x = -1 + 2 * (e.clientX - canvas.offsetLeft - canvasContainer.offsetLeft) / canvas.offsetWidth;
    let y = 1 - 2 * (e.clientY - canvas.offsetTop - canvasContainer.offsetTop) / canvas.offsetHeight;
    
    return { x, y };
}

function getMousePositionOnCanvas(X, Y) {
    let x = -1 + 2 * (X - canvas.offsetLeft - canvasContainer.offsetLeft) / canvas.offsetWidth;
    let y = 1 - 2 * (Y - canvas.offsetTop - canvasContainer.offsetTop) / canvas.offsetHeight;

    return { x, y };
}


function updateLayer(objects) {
    const rectangleLogo = `
        <svg class='svg' width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.1" y="3.1" width="7.8" height="5.8" stroke="white" stroke-opacity="0.3" stroke-width="1.3" />
        </svg>
    `

    const squareLogo = `
        <svg class="svg" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.1" y="2.1" width="7.8" height="7.8" stroke="white" stroke-opacity="0.3" stroke-width="1.3"/>
        </svg>
    `

    const lineLogo = `
        <svg class="svg" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="1.92929" y1="9.92929" x2="9.92929" y2="1.92929" stroke="white" stroke-opacity="0.3" stroke-width="1.3"/>
        </svg>
    `

    const polygonLogo = `
        <svg class="svg" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
                d="M8.44227 1.76987L10.8845 6L8.44226 10.2301L3.55773 10.2301L1.11547 6L3.55773 1.76987L8.44227 1.76987Z" 
                stroke="white" stroke-opacity="0.3" stroke-width="1.3"/>
        </svg>
    `



    let layerContainer = document.getElementById("left-sidebar");
    const itemLayerHeader = document.getElementById("item-layer-header");
    layerContainer.innerHTML = "";
    layerContainer.appendChild(itemLayerHeader);


    const parser = new DOMParser();

    let cntRectangles = 0;
    let cntSquares = 0;
    let cntLines = 0;
    let cntPolygons = 0;
    let curVertex = 0;


    for (let i = 0; i < objects.length; i++) {
        layerContainer.insertAdjacentHTML('beforeend', `
            <div class='item-layer'>
                <div class='item-layer-container'>
                    <div class='shape-item'>
                        <div class='shape-item-logo'>
                            
                        </div>
                        <div class='shape-item-name'>
                           
                        </div>
                    </div>
                </div>
            </div>
        `);

        let shapeItemLogo = document.getElementsByClassName("shape-item-logo")[i];
        let shapeItemName = document.getElementsByClassName("shape-item-name")[i];

        if (objects[i].name == "Rectangle") {
            shapeItemLogo.insertAdjacentHTML('beforeend', rectangleLogo);
            shapeItemName.insertAdjacentText('beforeend', "Rectangle ");
            shapeItemName.insertAdjacentHTML('beforeend', "<span class='shape-item-number'>" + (cntRectangles + 1) + "</span>");
            cntRectangles++;
        }
        else if (objects[i].name == "Square") {
            shapeItemLogo.insertAdjacentHTML('beforeend', squareLogo);
            shapeItemName.insertAdjacentText('beforeend', "Square ");
            shapeItemName.insertAdjacentHTML('beforeend', "<span class='shape-item-number'>" + (cntSquares + 1) + "</span>");
            cntSquares++;
        }
        else if (objects[i].name == "Line") {
            shapeItemLogo.insertAdjacentHTML('beforeend', lineLogo);
            shapeItemName.insertAdjacentText('beforeend', "Line ");
            shapeItemName.insertAdjacentHTML('beforeend', "<span class='shape-item-number'>" + (cntLines + 1) + "</span>");
            cntLines++;
        }
        else if (objects[i].name == "Polygon") {
            shapeItemLogo.insertAdjacentHTML('beforeend', polygonLogo);
            shapeItemName.insertAdjacentText('beforeend', "Polygon ");
            shapeItemName.insertAdjacentHTML('beforeend', "<span class='shape-item-number'>" + (cntPolygons + 1) + "</span>");
            cntPolygons++;
        }

        for (let j = 0; j < objects[i].vertices.length; j++) {
            let itemLayerContainer = document.getElementsByClassName("item-layer-container")[i];
            itemLayerContainer.insertAdjacentHTML('beforeend', `
                <div class='vertex-item'>
                    <div class='vertex-item-name'>
                        
                    </div>
                </div>
            `);

            let vertexItemName = document.getElementsByClassName("vertex-item-name")[curVertex];
            curVertex++;
            vertexItemName.insertAdjacentText('beforeend', "Vertex ");
            vertexItemName.insertAdjacentHTML('beforeend', "<span class='vertex-item-number'>" + (j + 1) + "</span>");
            let vertexItem = itemLayerContainer.lastChild;
        }
    }
}


function updateDetailItemShape(object){
    let detailItemContainer = document.getElementById("right-sidebar");
    const itemDetailHeader = document.getElementById("detail-item-header");
    const deleteButtonContainer = document.getElementById("delete-button-container");
    detailItemContainer.innerHTML = "";
    detailItemContainer.appendChild(itemDetailHeader);
    detailItemContainer.appendChild(deleteButtonContainer);

    detailItemContainer.insertAdjacentHTML('beforeend', `
        <div class="detail-item" id="size-and-position">
            <div class="item-container" id="position">
                <div class="item">
                    <label for="x">X</label>
                    <input type="number" id="x" value="0">
                </div>
                <div class="item">
                    <label for="y">Y</label>
                    <input type="number" id="y" value="0">
                </div>
            </div>
            <div class="item-container" id="size">
                <div class="item">
                    <label for="width">W</label>
                    <input type="number" id="width" value="0">
                </div>
                <div class="item">
                    <label for="height">H</label>
                    <input type="number" id="height" value="0">
                </div>
            </div>
        </div>
        <hr>
        <div class="detail-item" id="rotation">
            <div class="item-header">
                Rotation
            </div>
            <div class="item-container">
                <div class="item">
                    <div class="rotation-container">
                        <input type="range" min="0" max="360" id="rotation" value="0">
                    </div>
                </div>
                <div class="item" id="rotation-value">360<span>&deg</span></div>
            </div>
        </div>
        <hr>

        <!-- TO DO: idnya dibedain -->
        <div class="detail-item" id="color-picker">
            <div class="item-header">
                Fill
            </div>
            <div class="item-container">
                <div class="item color-input" id="color-input">
                    <div class="color-wrapper">
                        <input class="color" type="color" id="color" value="#000000">
                    </div>
                    <input class="color-hex" type="text" id="color-hex" value="000000">
                    <input class="opacity" type="text" id="opacity" value="100%">
                </div>
            </div>
        </div>
        <hr>

        <div class="detail-item" id="dilatation">
            <div class="item-header">
                Dilatation
            </div>
            <div class="item-container">
                <div class="item">
                    <input type="number" id="line-width" value="100" min="0.0000" step="0.1000">
                </div>
                <div class="item">
                    %
                </div>
            </div>
        </div>
    `);

    let x = document.getElementById("x");
    let y = document.getElementById("y");
    let width = document.getElementById("width");
    let height = document.getElementById("height");
    let rotation = document.getElementById("rotation");
    let rotationValue = document.getElementById("rotation-value");
    let color = document.getElementById("color");
    let colorHex = document.getElementById("color-hex");
    let opacity = document.getElementById("opacity");
    let lineWidth = document.getElementById("line-width");

    let minVertex = object.findMin();
    let maxVertex = object.findMax();

    let x_1 = (minVertex.x+1)/2;
    let y_1 = (1-minVertex.y)/2;
    let x_2 = (maxVertex.x+1)/2;
    let y_2 = (1-maxVertex.y)/2;

    x.value = Math.min(x_1, x_2);
    x.value *= canvas.offsetWidth;
    y.value = Math.min(y_1, y_2);
    y.value *= canvas.offsetHeight;



    width.value = Math.abs(x_1-x_2)*canvas.offsetWidth;
    height.value = Math.abs(y_1-y_2)*canvas.offsetHeight;

    console.log(object.tetha);
    rotation.value = object.tetha;
    rotationValue.innerHTML = object.tetha + "<span>&deg</span>";

    // color.value = object.color;
    lineWidth.value = object.lineWidth;
}
