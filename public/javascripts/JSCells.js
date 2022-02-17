//Written by Marcus Brook 180171394

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.hypot(dx, dy);
  }
  static midpoint(a,b){
      return new Point((a.x+b.x)/2,(a.y+b.y)/2)
  }
  static gradient(a,b){
      return new Gradient((a.y-b.y)/(a.x-b.x))
  }
  equals(a){
      return this.x==a.x && this.y==a.y;
  }
}
class Gradient{
    constructor(gra){
        this.gra=gra;
    }
    invert(){
        return -1/this.gra;
        
    }
}
class mLine{
    constructor(gradient, point, radius){
        let dx=Math.sqrt(radius**2/(1+gradient**2))
        let dy=gradient*dx
        this.first=new Point(point.x-dx,point.y-dy)
        this.second=new Point(point.x+dx,point.y+dy)
    }
}
class JSCells{
    drawAll() {
        this.clearCanvas()
        this.context.lineWidth = 2
        for (let cell of this.cells) {
            this.context.beginPath();
            this.context.arc(cell.x, cell.y, 4, 0, 2 * Math.PI);
            this.context.stroke();
            //for (let cell2 of cells){
            //    if(!cell.equals(cell2)){
            //
            //       drawMiddleLine(cell, cell2)
            //    }
            //}
        }
    }
    drawMiddleLine(p1, p2) {
        context.beginPath();
        this.mid = Point.midpoint(p1, p2)
        this.gra = Point.gradient(p1, p2).invert()

        this.lin = new mLine(this.gra, this.mid, 10)
        this.context.moveTo(this.lin.first.x, this.lin.first.y)
        this.context.lineTo(this.lin.second.x, this.lin.second.y)
        this.context.stroke();
        this.context.beginPath();
        this.context.arc(this.mid.x, this.mid.y, 1, 0, 2 * Math.PI);
        this.context.stroke();
    }
    //draws the background over everything, clearing the canvas
    clearCanvas() {
        this.context.beginPath()
        this.context.fillStyle = "#A0FFA0"
        this.context.rect(0, 0, this.canvasWidth, this.canvasHeight)
        this.context.fill()
    }
    //This function recursively draws frames and updates everything; creating animation
    nextFrame() {
        this.requestID = requestAnimationFrame(this.nextFrame.bind(this));
        this.clearCanvas()
        this.drawAll()
    }

    //This gives every global variable its starting value
    resetValues() {
        this.canvas = document.getElementById("JSCellsCanvas");
        this.context = this.canvas.getContext("2d");
        this.canvasHeight = this.canvas.height
        this.canvasWidth = this.canvas.width
        this.cells = [new Point(100, 100)]
    }
    constructor() {
        //Declaration of all global variables
        this.canvas = null			//The canvas element
        this.context = null			//The context of the canvas element
        this.canvasHeight = null	//The height of the canvas element
        this.canvasWidth = null		//The width of the canvas element
        this.requestID = null		//Used in loading frames
        this.cells = null
        this.resetValues()

        document.getElementById("JSCellsAdd").addEventListener("click", function () {
            this.cells.push(
                new Point(
                    Math.floor(
                        Math.random() * this.canvasWidth
                    ),
                    Math.floor(
                        Math.random() * this.canvasHeight
                    )
                )
            )
        }.bind(this))
        //This makes the reset button set all the global values to their default value
        document.getElementById("JSCellsReset").addEventListener("click", this.resetValues.bind(this))

        //Starts the animation
        this.nextFrame()
    }
}

new JSCells()