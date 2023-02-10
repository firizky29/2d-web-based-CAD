const euclideanDistance = (A,B) => {
    return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
};

const norm = (deg) => {
    return ((((deg + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
};

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
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

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
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

function drawHitbox(object){
    let point1 = object.findMin();
    let point2 = object.findMax();
    const color = new Color(0.45,0.55,1);

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

function drawVertexHitbox(object, selectedVertexId){
    let vertex = object.vertices[selectedVertexId];
    let radius = 20/canvas.width; 
    const color = new Color(0.95,0.55,0.25);

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


function hoverObject(e, objects){
    let mousePosition = getMousePosition(e);
    let min, max, object;

    for (let i = 0;i<objects.length;i++){
        object = objects[i];

        min = object.findMin();
        max = object.findMax();

        if (mousePosition.x >= min.x && mousePosition.x <= max.x && mousePosition.y >= min.y && mousePosition.y <= max.y){
            // object selected
            return i;
        }
        else{
            // no object selected
        }
    }
}

function hoverVertex(e, object){
    let mousePosition = getMousePosition(e);
    let min, max, vertex;
    let radius = 20/canvas.width;

    for (let i = 0;i<object.vertices.length;i++){
        vertex = object.vertices[i];

        min = new Point(vertex.x - radius, vertex.y - radius);
        max = new Point(vertex.x + radius, vertex.y + radius);

        if (mousePosition.x >= min.x && mousePosition.x <= max.x && mousePosition.y >= min.y && mousePosition.y <= max.y){
            // vertex selected
            return i;
        }
        else{
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

    return new Color(r/255, g/255, b/255);
}

function getMousePosition(e){
    let x = -1 + 2 * (e.clientX - canvas.offsetLeft)/canvas.width;
    let y = 1 - 2  *(e.clientY - canvas.offsetTop)/canvas.height;

    return {x, y};
}

