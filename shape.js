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
        this.color = 
            new Color(color.red, 
                color.green, 
                color.blue);        // Color of the shape
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

}


class Line extends Shape{
    // Kelas Line
    // parameter: gl, points, color
    constructor(gl, points, color){
        super(gl, points, color, gl.LINES);
    }
}

class Rectangle extends Shape{
    // Kelas Rectangle
    // parameter: gl, points, color
    constructor(gl, points, color){
        super(gl, points, color, gl.LINE_LOOP);
    }
}