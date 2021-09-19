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
        var dx=Math.sqrt(radius**2/(1+gradient**2))
        var dy=gradient*dx
        this.first=new Point(point.x-dx,point.y-dy)
        this.second=new Point(point.x+dx,point.y+dy)
    }
}

function drawAll(){
    clearCanvas()
    context.lineWidth=2
    for(let cell of cells){
        context.beginPath();
        context.arc(cell.x,cell.y,4,0,2*Math.PI);
        context.stroke();
        //for (let cell2 of cells){
        //    if(!cell.equals(cell2)){
        //       
        //       drawMiddleLine(cell, cell2)
        //    }
        //}
    }
}

function drawMiddleLine(p1, p2){
    context.beginPath();
    mid=Point.midpoint(p1,p2)
    gra=Point.gradient(p1,p2).invert()
    
    lin=new mLine(gra,mid,10)
    context.moveTo(lin.first.x,lin.first.y)
    context.lineTo(lin.second.x,lin.second.y)
    context.stroke();
    context.beginPath();
    context.arc(mid.x,mid.y,1,0,2*Math.PI);
    context.stroke();
}







//draws the background over everything, clearing the canvas
function clearCanvas(){
	context.beginPath()
	context.fillStyle="#A0FFA0"
	context.rect(0,0,canvasWidth,canvasHeight)
	context.fill()
}

//This function recursively draws frames and updates everything; creating animation
function nextFrame(){
	requestID = requestAnimationFrame(nextFrame);
	clearCanvas()
	drawAll()
}

//This gives every global variable its starting value
function resetValues(){
	canvas1=document.getElementById("canvas1");
	context=canvas1.getContext("2d");
	canvasHeight=canvas1.height
	canvasWidth=canvas1.width
    cells = [new Point(100,100)]
}

//Declaration of all global variables
var canvas1			//The canvas element
var context			//The context of the canvas element
var canvasHeight	//The height of the canvas element
var canvasWidth		//The width of the canvas element
var requestID		//Used in loading frames
var cells


resetValues()

document.getElementById("cell").addEventListener("click",function(){
	//A check needs to be made so that the animal can't stop mid-air to sit
	cells.push(new Point(Math.floor((Math.random() * canvasWidth)),Math.floor((Math.random() * canvasHeight))))
})
//This makes the reset button set all the global values to their default value
document.getElementById("reset").addEventListener("click",resetValues)

//Starts the animation
nextFrame()