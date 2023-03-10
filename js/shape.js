class Color {
    // Kelas Color
    // parameter: red, green, blue
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

class Point {
    // Kelas Point
    // parameter: x, y
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vertex {
    // Kelas Vertex
    // parameter: x, y
    constructor(point, color) {
        this.x = point.x;
        this.y = point.y;
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        this.alpha = color.alpha
    }

    translateX(x) {
        this.x = screenToCanvas(x);
    }

    translateY(y) {
        this.y = screenToCanvas(y);
    }

    fill(color) {
        const colorRGB = hexToRGB(color);
        this.red = colorRGB.red;
        this.green = colorRGB.green;
        this.blue = colorRGB.blue;
    }

    fillOpacity(alpha) {
        this.alpha = alpha;
    }
}

class Shape {
    // Kelas abstrak shape secara umum
    // parameter: gl, vertices, GL_SHAPE

    constructor(gl, vertices, GL_SHAPE, name, theta=0, dilatation=1) {
        this.gl = gl;               // WebGL context
        this.vertices = vertices;       // Array of vertex
        this.GL_SHAPE = GL_SHAPE;   // GL Shape
        this.theta = theta;
        this.dilatation = dilatation;
        this.name = name;
    }

    // rendering
    draw() {
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
    findMin() {
        let min_x = this.vertices[0].x;
        let min_y = this.vertices[0].y;

        for (let vertex of this.vertices) {
            if (vertex.x < min_x) min_x = vertex.x;
            if (vertex.y < min_y) min_y = vertex.y;
        }

        return new Point(min_x, min_y);
    }

    // find maximum x and maximum y
    findMax() {
        let max_x = this.vertices[0].x;
        let max_y = this.vertices[0].y;

        for (let vertex of this.vertices) {
            if (vertex.x > max_x) max_x = vertex.x;
            if (vertex.y > max_y) max_y = vertex.y;
        }

        return new Point(max_x, max_y);
    }

    // find centroid
    findCentroid() {
        // find average out of all vertex
        let sum_x = 0;
        let sum_y = 0;

        for (let vertex of this.vertices) {
            sum_x += vertex.x;
            sum_y += vertex.y;
        }

        return new Point(sum_x / this.vertices.length, sum_y / this.vertices.length);
    }

    // move shape
    moveShape(e, relativePosition) {
        // update vertex
        let client = new Point(e.clientX, e.clientY);
        client = screenToCanvas(client);
        relativePosition[0] = screenToCanvasX(relativePosition[0]);
        relativePosition[1] = screenToCanvasY(relativePosition[1]);

        let x = client.x - relativePosition[0];
        let y = client.y - relativePosition[1];

        // update all vertex
        for (let vertex of this.vertices) {
            vertex.x += x;
            vertex.y += y;
        }
    }

    // move vertex
    moveVertex(e, relativePosition, vertexId) {
        // update vertex
        let client = new Point(e.clientX, e.clientY);
        client = screenToCanvas(client);
        relativePosition[0] = screenToCanvasX(relativePosition[0]);
        relativePosition[1] = screenToCanvasY(relativePosition[1]);

        let x = client.x - relativePosition[0];
        let y = client.y - relativePosition[1];

        // update vertex
        this.vertices[vertexId].x += x;
        this.vertices[vertexId].y += y;
    }

    // rotate shape
    rotate(currRotation) {
        // reverse rotation
        let rotation = -1 * (currRotation - this.theta);
        this.theta = currRotation;

        let centroid = getReverseMousePosition(this.findCentroid());
        rotation = rotation / 180 * Math.PI;

        for (let vertex of this.vertices) {
            let vertex_ = getReverseMousePosition(vertex);
            //euclidien distance
            let dis = euclideanDistance(centroid, vertex_);

            // angle
            let arg = norm(Math.atan2(vertex_.y - centroid.y, vertex_.x - centroid.x) + rotation);

            // new vertex
            vertex_.x = centroid.x + dis * Math.cos(arg);
            vertex_.y = centroid.y + dis * Math.sin(arg);
            let temp = getMousePositionOnCanvas(vertex_.x, vertex_.y);
            vertex.x = temp.x;
            vertex.y = temp.y;
        }
    }

    fill(color) {
        const colorRGB = hexToRGB(color);

        for (let vertex of this.vertices) {
            vertex.red = colorRGB.red;
            vertex.green = colorRGB.green;
            vertex.blue = colorRGB.blue;
        }
    }

    fillOpacity(opacity) {
        for (let vertex of this.vertices) {
            vertex.alpha = opacity;
        }
    }

    translateX(x) {
        const d = screenToCanvasX(x) - this.findMin().x;

        for (let vertex of this.vertices) {
            vertex.x += d;
        }
    }

    translateY(y) {
        const d = screenToCanvasY(y) - this.findMax().y;

        for (let vertex of this.vertices) {
            vertex.y += d;
        }
    }

    stretchX(w) {
        const vertexMin = canvasToScreen(this.findMin());
        const vertexMax = canvasToScreen(this.findMax());
        const lastWidth = Math.abs(vertexMax.x - vertexMin.x);

        for (let vertex of this.vertices) {
            vertex.x -= screenToCanvasX(vertexMin.x);
            vertex.x *= w / lastWidth;
            vertex.x += screenToCanvasX(vertexMin.x);
        }
    }

    stretchY(h) {
        const vertexMin = canvasToScreen(this.findMin());
        const vertexMax = canvasToScreen(this.findMax());
        const lastHeight = Math.abs(vertexMax.y - vertexMin.y);

        for (let vertex of this.vertices) {
            vertex.y -= screenToCanvasY(vertexMax.y);
            vertex.y *= h / lastHeight;
            vertex.y += screenToCanvasY(vertexMax.y);
        }
    }

    dilate(k) {
        const centroid = canvasToScreen(this.findCentroid());

        for (let vertex of this.vertices) {
            vertex.x = canvasToScreenX(vertex.x);
            vertex.y = canvasToScreenY(vertex.y);
            vertex.x -= centroid.x;
            vertex.y -= centroid.y;
            vertex.x *= k / this.dilatation;
            vertex.y *= k / this.dilatation;
            vertex.x += centroid.x;
            vertex.y += centroid.y;
            vertex.x = screenToCanvasX(vertex.x);
            vertex.y = screenToCanvasY(vertex.y);
        }

        this.dilatation = k;
    }
}

class Line extends Shape {
    // Kelas Line
    // parameter: gl, vertices
    constructor(gl, vertices, GL_SHAPE=gl.LINES, name="Line", theta=0, dilatation=1) {
        super(gl, vertices, GL_SHAPE, name, theta, dilatation);
        this.calculateDistance();
    }

    // setter points
    setPoints(points) {
        // loop vertices
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].x = points[i].x;
            this.vertices[i].y = points[i].y;
        }

        this.calculateDistance();
    }

    calculateDistance() {
        this.length = Math.sqrt(Math.pow(this.vertices[0].x - this.vertices[1].x, 2) + Math.pow(this.vertices[0].y - this.vertices[1].y, 2));
    }

    setNewLength(newLength) {
        if (length <= 0) {
            return;
        }

        this.calculateDistance();
        let centroid = this.findCentroid();
        let lambdaX = (newLength / this.length) * (this.vertices[0].x - this.vertices[1].x) / 2;
        let lambdaY = (newLength / this.length) * (this.vertices[0].y - this.vertices[1].y) / 2;

        this.vertices[0].x = centroid.x - lambdaX
        this.vertices[0].y = centroid.y - lambdaY;

        this.vertices[1].x = centroid.x + lambdaX;
        this.vertices[1].y = centroid.y + lambdaY;

        this.calculateDistance();
    }
}

class Hitbox extends Shape {
    // Kelas Hitbox
    // parameter: gl, vertices
    constructor(gl, vertices) {
        super(gl, vertices, gl.LINE_LOOP, "Hitbox");
    }
}

class Square extends Shape {
    // Kelas Square
    // parameter: gl, vertices
    constructor(gl, vertices, GL_SHAPE=gl.TRIANGLE_STRIP, name="Square", theta=0, dilatation=1) {
        super(gl, vertices, GL_SHAPE, name, theta, dilatation);
    }

    // get opposite vertex
    getOppositeVertex(vertexId) {
        if (vertexId === 0) {
            return 3;
        } else if (vertexId === 1) {
            return 2;
        } else if (vertexId === 2) {
            return 1;
        } else if (vertexId === 3) {
            return 0;
        }
    }

    // get centroid
    getCentroid(vertexId, oppositeVertex) {
        return [
            (this.vertices[vertexId].x + this.vertices[oppositeVertex].x)/2 ,
            (this.vertices[vertexId].y + this.vertices[oppositeVertex].y)/2
        ];
    }

    // get distance
    getDistance(vertexId, centroid) {
        return Math.sqrt(Math.pow(this.vertices[vertexId].x - centroid[0], 2) + Math.pow(this.vertices[vertexId].y - centroid[1], 2));
    }

    // get angle
    getAngle(vertexId, centroid) {
        return Math.atan2(this.vertices[vertexId].y - centroid[1], this.vertices[vertexId].x - centroid[0]);
    }

    // TRIANGLE_STRIP draw order
    setOrder(vertexId, vertex1, vertex2) {
        if(vertexId == 3){
            this.vertices[1].x = vertex1[0];
            this.vertices[1].y = vertex1[1];

            this.vertices[2].x = vertex2[0];
            this.vertices[2].y = vertex2[1];
        }
        else if(vertexId == 0){
            this.vertices[2].x = vertex1[0];
            this.vertices[2].y = vertex1[1];

            this.vertices[1].x = vertex2[0];
            this.vertices[1].y = vertex2[1];
        }
        else if(vertexId == 1){
            this.vertices[0].x = vertex1[0];
            this.vertices[0].y = vertex1[1];

            this.vertices[3].x = vertex2[0];
            this.vertices[3].y = vertex2[1];
        }
        else if(vertexId == 2){
            this.vertices[3].x = vertex1[0];
            this.vertices[3].y = vertex1[1];

            this.vertices[0].x = vertex2[0];
            this.vertices[0].y = vertex2[1];
        }

        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].x = screenToCanvasX(this.vertices[i].x);
            this.vertices[i].y = screenToCanvasY(this.vertices[i].y);
        }
    }

    moveVertex(e, relativePosition, vertexId){
        // get opposite vertex
        let oppositeVertex = this.getOppositeVertex(vertexId);

        // calculate position based on theta and centroid
        let client = new Point(e.clientX, e.clientY);
        client = screenToCanvas(client);
        relativePosition[0] = screenToCanvasX(relativePosition[0]);
        relativePosition[1] = screenToCanvasY(relativePosition[1]);

        let x = client.x - relativePosition[0];
        let y = client.y - relativePosition[1];

        // set new vertex position to relative position
        this.vertices[vertexId].x += x;
        this.vertices[vertexId].y += y;

        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].x = canvasToScreenX(this.vertices[i].x);
            this.vertices[i].y = canvasToScreenY(this.vertices[i].y);
        }

        // centroid
        let centroid = this.getCentroid(vertexId, oppositeVertex);

        // find distance from centroid to vertex
        let distance = this.getDistance(vertexId, centroid);

        // find angle from centroid to vertex
        let angle = this.getAngle(vertexId, centroid);

        // set new vertex position
        // 90 degree after vertexId
        let vertex1 = [
            centroid[0] + distance * Math.cos(angle + Math.PI/2),
            centroid[1] + distance * Math.sin(angle + Math.PI/2)
        ]

        // 90 degree before vertexId
        let vertex2 = [
            centroid[0] + distance * Math.cos(angle - Math.PI/2),
            centroid[1] + distance * Math.sin(angle - Math.PI/2)
        ]
        
        // to handle TRIANGLE_STRIP drawing order
        this.setOrder(vertexId, vertex1, vertex2);
    }
}

class Rectangle extends Shape {
    // Kelas Rectangle
    // parameter: gl, vertices
    constructor(gl, vertices, GL_SHAPE=gl.TRIANGLE_STRIP, name="Rectangle", theta=0, dilatation=1) {
        super(gl, vertices, GL_SHAPE, name, theta, dilatation);
        this.theta0 = 0;
    }

    // get opposite vertex
    getOppositeVertex(vertexId) {
        if (vertexId === 0) {
            return 3;
        } else if (vertexId === 1) {
            return 2;
        } else if (vertexId === 2) {
            return 1;
        } else if (vertexId === 3) {
            return 0;
        }
    }

    // get centroid
    getCentroid(vertexId, oppositeVertex) {
        return [
            (this.vertices[vertexId].x + this.vertices[oppositeVertex].x)/2 ,
            (this.vertices[vertexId].y + this.vertices[oppositeVertex].y)/2
        ];
    }

    // get distance
    getDistance(vertexId, centroid) {
        return Math.sqrt(Math.pow(this.vertices[vertexId].x - centroid[0], 2) + Math.pow(this.vertices[vertexId].y - centroid[1], 2));
    }

    // get angle
    getAngle(vertexId, centroid) {
        return Math.atan2(this.vertices[vertexId].y - centroid[1], this.vertices[vertexId].x - centroid[0]);
    }

    // TRIANGLE_STRIP draw order
    setOrder(vertexId, vertex1, vertex2) {
        if(vertexId == 3){
            this.vertices[1].x = vertex1[0];
            this.vertices[1].y = vertex1[1];

            this.vertices[2].x = vertex2[0];
            this.vertices[2].y = vertex2[1];
        }
        else if(vertexId == 0){
            this.vertices[2].x = vertex1[0];
            this.vertices[2].y = vertex1[1];

            this.vertices[1].x = vertex2[0];
            this.vertices[1].y = vertex2[1];
        }
        else if(vertexId == 1){
            this.vertices[0].x = vertex1[0];
            this.vertices[0].y = vertex1[1];

            this.vertices[3].x = vertex2[0];
            this.vertices[3].y = vertex2[1];
        }
        else if(vertexId == 2){
            this.vertices[3].x = vertex1[0];
            this.vertices[3].y = vertex1[1];

            this.vertices[0].x = vertex2[0];
            this.vertices[0].y = vertex2[1];
        }

        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].x = screenToCanvasX(this.vertices[i].x);
            this.vertices[i].y = screenToCanvasY(this.vertices[i].y);
        }
    }
    
    moveVertex(e, relativePosition, vertexId){
        // get opposite vertex
        let oppositeVertex = this.getOppositeVertex(vertexId);

        // calculate position based on theta and centroid
        let client = new Point(e.clientX, e.clientY);
        client = screenToCanvas(client);
        relativePosition[0] = screenToCanvasX(relativePosition[0]);
        relativePosition[1] = screenToCanvasY(relativePosition[1]);

        let x = client.x - relativePosition[0];
        let y = client.y - relativePosition[1];
        
        // set new vertex position to relative position
        this.vertices[vertexId].x += x;
        this.vertices[vertexId].y += y;

        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].x = canvasToScreenX(this.vertices[i].x);
            this.vertices[i].y = canvasToScreenY(this.vertices[i].y);
        }

        // centroid
        let centroid = this.getCentroid(vertexId, oppositeVertex);

        // find distance from centroid to vertex
        let distance = this.getDistance(vertexId, centroid);

        // find angle from centroid to vertex
        let angle = this.getAngle(vertexId, centroid);

        // set new vertex position
        let theta1, theta2;
        if (vertexId == 3 || vertexId == 0){
            theta1 = 2 * this.theta0;
            theta2 = 2 * this.theta0 - Math.PI;
        }
        else if(vertexId == 1 || vertexId == 2){
            theta1 = Math.PI - 2 * this.theta0;
            theta2 = - 2 * this.theta0
        }

        // 90 degree after vertex by theta
        let vertex1 = [
            centroid[0] + distance * Math.cos(angle + theta1),
            centroid[1] + distance * Math.sin(angle + theta1)
        ]
        // 90 degree before vertex by theta
        let vertex2 = [
            centroid[0] + distance * Math.cos(angle + theta2),
            centroid[1] + distance * Math.sin(angle + theta2)
        ]
        
        // to handle TRIANGLE_STRIP drawing order
        this.setOrder(vertexId, vertex1, vertex2);
    }

    calculateInitialTheta(){
        let tempVertice1 = canvasToScreen(this.vertices[0]);
        let tempVertice2 = canvasToScreen(this.vertices[3]);

        let centroid = [
            (tempVertice1.x + tempVertice2.x)/2 ,
            (tempVertice1.y + tempVertice2.y)/2
        ];

        this.theta0 = - Math.atan2(tempVertice1.y - centroid[1], tempVertice1.x - centroid[0]) + Math.PI/2;
    }

    stretchX(w){
        // calculate theta by horizontal line
        let theta0 = this.theta
        this.theta = 0

        let tempVertice1 = canvasToScreen(this.vertices[3]);
        let tempVertice2 = canvasToScreen(this.vertices[1]);

        let theta = (- Math.atan2(tempVertice1.y - tempVertice2.y, tempVertice1.x - tempVertice2.x))* 180 / Math.PI;

        this.rotate(-theta);
        this.theta = 0;
        super.stretchX(w);
        this.calculateInitialTheta();
        this.rotate(theta);

        this.theta = theta0
    }

    stretchY(h){
        // calculate theta by horizontal line
        let theta0 = this.theta
        this.theta = 0

        // calculate theta by horizontal line
        let tempVertice1 = canvasToScreen(this.vertices[3]);
        let tempVertice2 = canvasToScreen(this.vertices[1]);

        let theta = (- Math.atan2(tempVertice1.y - tempVertice2.y, tempVertice1.x - tempVertice2.x))* 180 / Math.PI;

        this.rotate(-theta);
        this.theta = 0;
        super.stretchY(h);
        this.calculateInitialTheta();
        this.rotate(theta);
        
        this.theta = theta0
    }
}

class Polygon extends Shape {
    // Kelas Polygon
    // parameter: gl, vertices
    constructor(gl, vertices, GL_SHAPE=gl.TRIANGLE_FAN, name="Polygon", theta=0, dilatation=1) {
        super(gl, vertices, GL_SHAPE, name, theta, dilatation);
        this.createConvexHull = false;
    }

    deleteVertex(vertexId) {
        this.vertices.splice(vertexId, 1);
    }

    addVertex(point) {
        this.vertices.push(new Vertex(point, new Color(0.85, 0.85, 0.85, 1)));
    }

    setCreateConvexHull(createConvexHull) {
        this.createConvexHull = createConvexHull;
    }

    findBottomLeft(temp) {
        let bottomLeft = 0;

        for (let i = 1; i < temp.length; i++) {
            if (temp[i].y < temp[bottomLeft].y ||
                (temp[i].y == temp[bottomLeft].y &&
                    temp[i].x < temp[bottomLeft].x)) {
                bottomLeft = i;
            }
        }

        return bottomLeft;
    }

    orientation(p1, p2, p3) {
        const v = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);
        if (v < 0) return -1;
        if (v > 0) return 1;

        return 0;
    }

    // The main function to find the convex hull
    convexHull() {
        if(this.createConvexHull == false) return;

        // Sort the points by polar angle with respect to the bottom-left point
        let tempVertices = [];

        for (let i = 0; i < this.vertices.length; i++) {
            tempVertices.push(new Vertex(
                new Point(this.vertices[i].x, this.vertices[i].y), 
                new Color(
                    this.vertices[i].red, 
                    this.vertices[i].green, 
                    this.vertices[i].blue,
                    this.vertices[i].alpha
                )
            ));
        }

        const bottomLeft = this.findBottomLeft(tempVertices);

        tempVertices.sort((a, b) => {
            const o = this.orientation(tempVertices[bottomLeft], a, b);
            
            if (o == 0) {
                const p0x = tempVertices[bottomLeft].x;
                const p0y = tempVertices[bottomLeft].y;
                if((p0x - a.x) * (p0x - a.x) + (p0y - a.y) * (p0y - a.y) < 
                    (p0x - b.x) * (p0x - b.x) + (p0y - b.y) * (p0y - b.y)){
                    return 1;
                } else{
                    return -1;
                }
            }

            // If angles are equal, choose the closest point to the bottom-left point
            return (o < 0) ? 1 : -1;
        });

        // Create a stack and add the first three points
        let stack = [];

        // Iterate through the rest of the tempVertices
        for (let i = 0; i < tempVertices.length; i++) {
            // Remove tempVertices that create a concave angle
            while (stack.length > 1 && this.orientation(stack[stack.length - 2], stack[stack.length - 1], tempVertices[i]) < 0) {
                stack.pop();
            }
            // Add the current point to the stack
            stack.push(tempVertices[i]);
        }
        
        this.vertices = stack;
    }
}