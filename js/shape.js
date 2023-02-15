class Color {
    // Kelas Color
    // parameter: red, green, blue
    constructor(red, green, blue, alpha){
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

class Point{
    // Kelas Point
    // parameter: x, y
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
class Vertex {
    // Kelas Vertex
    // parameter: x, y
    constructor(point, color){
        this.x = point.x;
        this.y = point.y;
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        this.alpha = color.alpha
    }
}

class Shape{
    // Kelas abstrak shape secara umum
    // parameter: gl, vertices, GL_SHAPE

    constructor(gl, vertices, GL_SHAPE, name){
        this.gl = gl;               // WebGL context
        this.vertices = vertices;       // Array of vertex
        this.GL_SHAPE = GL_SHAPE;   // GL Shape
        this.theta = 0;
        this.dilatation = 1;
        this.name = name;
    }

    // rendering
    draw(){
        let vertices = [];
        for (let vertex of this.vertices) {
            vertices.push(
                vertex.x, 
                vertex.y, 
                vertex.red, 
                vertex.green, 
                vertex.blue,
                vertex.alpha
            );
        }

        this.gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW
        );

        this.gl.drawArrays(this.GL_SHAPE, 0, this.vertices.length);
    }

    // find minimum x and minimum y
    findMin(){
        let min_x = this.vertices[0].x;
        let min_y = this.vertices[0].y;
        for (let vertex of this.vertices) {
            if (vertex.x < min_x) min_x = vertex.x;
            if (vertex.y < min_y) min_y = vertex.y;
        }
        return new Point(min_x, min_y);
    }

    // find maximum x and maximum y
    findMax(){
        let max_x = this.vertices[0].x;
        let max_y = this.vertices[0].y;
        for (let vertex of this.vertices) {
            if (vertex.x > max_x) max_x = vertex.x;
            if (vertex.y > max_y) max_y = vertex.y;
        }
        return new Point(max_x, max_y);
    }

    // find centroid
    findCentroid(){
        // let min = this.findMin();
        // let max = this.findMax();
        // return new Point((min.x + max.x) / 2, (min.y + max.y) / 2);

        // find average out of all vertex
        let sum_x = 0;
        let sum_y = 0;

        for (let vertex of this.vertices) {
            sum_x += vertex.x;
            sum_y += vertex.y;
        }

        return new Point(sum_x/this.vertices.length, sum_y/this.vertices.length);
    }

    moveShape(e, relativePosition){
        // update vertex
        let x = 2*(e.clientX - relativePosition[0])/canvas.offsetWidth;
        let y = -2*(e.clientY - relativePosition[1])/canvas.offsetHeight;

        // update all vertex
        for (let vertex of this.vertices) {
            vertex.x += x;
            vertex.y += y;
        }

    }

    moveVertex(e, relativePosition, vertexId){
        // update vertex
        let x = 2*(e.clientX - relativePosition[0])/canvas.offsetWidth;
        let y = -2*(e.clientY - relativePosition[1])/canvas.offsetHeight;
        
        // update vertex
        this.vertices[vertexId].x += x;
        this.vertices[vertexId].y += y;
    }

    resizeSquare(e, relativePosition, vertexId){
        let x = 2*(e.clientX - relativePosition[0])/canvas.offsetWidth;
        let y = -2*(e.clientY - relativePosition[1])/canvas.offsetHeight;

        if (vertexId === 0) {
            this.vertices[0].x += x;
            this.vertices[0].y += x;

            this.vertices[1].x += x;
            this.vertices[2].y += x;
        } else if (vertexId === 1) {
            this.vertices[1].x -= y;
            this.vertices[1].y += y;

            this.vertices[0].x -= y;
            this.vertices[3].y += y;
        } else if (vertexId === 2) {
            this.vertices[2].x -= y;
            this.vertices[2].y += y;

            this.vertices[3].x -= y;
            this.vertices[0].y += y;
        } else if (vertexId === 3) {
            this.vertices[3].x += x;
            this.vertices[3].y += x;

            this.vertices[2].x += x;
            this.vertices[1].y += x;
        }
    }

    resizeRectangle(e, relativePosition, vertexId){
        let x = 2*(e.clientX - relativePosition[0])/canvas.offsetWidth;
        let y = -2*(e.clientY - relativePosition[1])/canvas.offsetHeight;

        if (vertexId === 0) {
            this.vertices[0].x += x;
            this.vertices[0].y += y;

            this.vertices[1].x += x;
            this.vertices[2].y += y;
        } else if (vertexId === 1) {
            this.vertices[1].x += x;
            this.vertices[1].y += y;

            this.vertices[0].x += x;
            this.vertices[3].y += y;
        } else if (vertexId === 2) {
            this.vertices[2].x += x;
            this.vertices[2].y += y;

            this.vertices[3].x += x;
            this.vertices[0].y += y;
        } else if (vertexId === 3) {
            this.vertices[3].x += x;
            this.vertices[3].y += y;

            this.vertices[2].x += x;
            this.vertices[1].y += y;
        }
    }

    rotate(currRotation){
        rotation = -1 * (currRotation-this.theta); //reverse rotation
        this.theta = currRotation;

        let centroid = this.findCentroid();
        rotation = rotation/ 180 * Math.PI ;
        for (let vertex of this.vertices) {
            //euclidien distance
            let dis = euclideanDistance(centroid, vertex);

            // angle
            let arg = norm(Math.atan2(vertex.y - centroid.y, vertex.x - centroid.x) + rotation);
            
            // new vertex
            vertex.x = centroid.x + dis * Math.cos(arg);
            vertex.y = centroid.y + dis * Math.sin(arg);
        }
    }

    updateColor(vertexId, color){   
        // set new vertex color
        this.vertices[vertexId].red = color.red;
        this.vertices[vertexId].green = color.green;
        this.vertices[vertexId].blue = color.blue;
        this.vertices[vertexId].alpha = color.alpha;
    }

}


class Line extends Shape{
    // Kelas Line
    // parameter: gl, vertices
    constructor(gl, vertices){
        super(gl, vertices, gl.LINES, "Line");
        this.calculateDistance();
    }

    // setter points
    setPoints(points){
        // loop vertices
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].x = points[i].x;
            this.vertices[i].y = points[i].y;
        }
        this.calculateDistance();
    }

    calculateDistance(){
        this.length = Math.sqrt(Math.pow(this.vertices[0].x - this.vertices[1].x, 2) + Math.pow(this.vertices[0].y - this.vertices[1].y, 2));
    }

    setNewLength(newLength){
        if (length <=0){
            return;
        }

        this.calculateDistance();
        let centroid = this.findCentroid();
        let lambdaX = (newLength/this.length) * (this.vertices[0].x - this.vertices[1].x) / 2;
        let lambdaY = (newLength/this.length) * (this.vertices[0].y - this.vertices[1].y) / 2;

        this.vertices[0].x = centroid.x - lambdaX
        this.vertices[0].y = centroid.y - lambdaY;

        this.vertices[1].x = centroid.x + lambdaX;
        this.vertices[1].y = centroid.y + lambdaY;
        
        this.calculateDistance();    
    }
}


class Hitbox extends Shape{
    // Kelas Hitbox
    // parameter: gl, vertices
    constructor(gl, vertices){
        super(gl, vertices, gl.LINE_LOOP, "Hitbox");
    }
}

class Square extends Shape{
    // Kelas Square
    // parameter: gl, vertices
    constructor(gl, vertices){
        super(gl, vertices, gl.TRIANGLE_STRIP, "Square");
    }
}

class Rectangle extends Shape{
    // Kelas Rectangle
    // parameter: gl, vertices
    constructor(gl, vertices){
        super(gl, vertices, gl.TRIANGLE_STRIP, "Rectangle");
    }
}

class Polygon extends Shape{
    // Kelas Polygon
    // parameter: gl, vertices
    constructor(gl, vertices){
        super(gl, vertices, gl.TRIANGLE_FAN, "Polygon");
    }

    deleteVertex(vertexId){
        this.vertices.splice(vertexId,1);
    }

}


