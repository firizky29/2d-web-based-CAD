class Point {
    // Kelas Point
    // parameter: x, y
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Color {
    // Kelas Color
    // parameter: red, green, blue
    constructor(red, green, blue){
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
}

class Shape{
    // Kelas abstrak shape secara umum
    // parameter: gl, points, color, GL_SHAPE

    constructor(gl, points, color, GL_SHAPE){
        this.gl = gl;               // WebGL context
        this.points = points;       // Array of points
        this.color = color          // Color of the shape
        this.GL_SHAPE = GL_SHAPE;   // GL Shape
    }

    // rendering
    draw(){
        let vertices = [];
        for (let point of this.points) {
            vertices.push(
              point.x,
              point.y,
              this.color.red / 255,
              this.color.green / 255,
              this.color.blue / 255
            );
        }
        this.gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW
        );
        this.gl.drawArrays(this.GL_SHAPE, 0, this.points.length);
    }

    // find minimum x and minimum y
    findMin(){
        let min_x = this.points[0].x;
        let min_y = this.points[0].y;
        for (let point of this.points) {
            if (point.x < min_x) min_x = point.x;
            if (point.y < min_y) min_y = point.y;
        }
        return new Point(min_x, min_y);
    }

    // find maximum x and maximum y
    findMax(){
        let max_x = this.points[0].x;
        let max_y = this.points[0].y;
        for (let point of this.points) {
            if (point.x > max_x) max_x = point.x;
            if (point.y > max_y) max_y = point.y;
        }
        return new Point(max_x, max_y);
    }

    // find centroid
    findCentroid(){
        let min = this.findMin();
        let max = this.findMax();
        return new Point((min.x + max.x) / 2, (min.y + max.y) / 2);
    }

    moveShape(e, relativePosition){
        // update vertex
        let x = 2*(e.clientX - relativePosition[0])/canvas.width;
        let y = -2*(e.clientY - relativePosition[1])/canvas.height;

        // update all points
        for (let point of this.points) {
            point.x += x;
            point.y += y;
        }

    }


}


class Line extends Shape{
    // Kelas Line
    // parameter: gl, points, color
    constructor(gl, points, color){
        super(gl, points, color, gl.LINES);
        this.calculateDistance();
    }

    // setter points
    setPoints(points){
        this.points = points;
        this.calculateDistance();
    }

    calculateDistance(){
        this.length = Math.sqrt(Math.pow(this.points[0].x - this.points[1].x, 2) + Math.pow(this.points[0].y - this.points[1].y, 2));
    }

    setNewLength(newLength){
        if (length <=0){
            return;
        }

        this.calculateDistance();
        let centroid = this.findCentroid();
        let lambdaX = (newLength/this.length) * (this.points[0].x - this.points[1].x) / 2;
        let lambdaY = (newLength/this.length) * (this.points[0].y - this.points[1].y) / 2;

        this.points[0] = new Point(centroid.x - lambdaX, centroid.y - lambdaY);
        this.points[1] = new Point(centroid.x + lambdaX, centroid.y + lambdaY);
        
        this.calculateDistance();    
    }
}

class Hitbox extends Shape{
    // Kelas Rectangle
    // parameter: gl, points, color
    constructor(gl, points, color){
        super(gl, points, color, gl.LINE_LOOP);
    }
}

