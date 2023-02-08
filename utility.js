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

function drawHitbox(point1, point2){
    // if vert1 and vert2 empty
    if (point1 == undefined || point2 == undefined) {
        return;
    }
    const vert1 = [point1.x, point1.y];
    const vert2 = [point2.x, point2.y];
    const color = new Color(0,0.25,0.75);

    const hitBoxVertices = [
        new Point(point1.x, point1.y), 
        new Point(point1.x, point2.y), 
        new Point(point2.x, point2.y), 
        new Point(point2.x, point1.y)
    ];
    let hitbox = new Hitbox(gl, hitBoxVertices, color);
    // console.log(hitbox)
    return hitbox;
}
