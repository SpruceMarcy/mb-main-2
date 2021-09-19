//Written by Marcy Brook

function drawCanvas(){
    var step=canvasWidth/Math.pow(2, document.getElementById("input").value)
	//draws the blue
	context.beginPath()
	context.fillStyle="#0000FF"
	context.rect(0,0,canvasWidth,canvasHeight)
	context.fill()
	//draws the red
	var parity=true
	for (var x = 0; x < canvasWidth; x+=step) {
        for (var y = 0; y < canvasHeight; y+=step) {
            if(parity){
                context.beginPath()
                context.fillStyle="#FF0000"
                context.rect(x,y,step,step)
                context.fill()
            }
            parity=!parity
        }
        parity=!parity
    }
}


//This gives every global variable its starting value
function resetValues(){
	canvas1=document.getElementById("output");
	context=canvas1.getContext("2d");
	canvasHeight=canvas1.height
	canvasWidth=canvas1.width
}

//Declaration of all global variables
var canvas1			//The canvas element
var context			//The context of the canvas element
var canvasHeight	//The height of the canvas element
var canvasWidth		//The width of the canvas element
resetValues()
drawCanvas()

document.getElementById("input").addEventListener("input",function(){
	drawCanvas()
})
