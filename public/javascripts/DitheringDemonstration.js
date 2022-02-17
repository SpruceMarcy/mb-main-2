//Written by Marcy Brook

function drawDitheringCanvas(){
    let step = ditheringCanvasHeight/Math.pow(2, document.getElementById("DitheringInput").value)
	//draws the blue
    ditheringContext.beginPath()
    ditheringContext.fillStyle="#2020b7"
    ditheringContext.rect(0,0,ditheringCanvasWidth,ditheringCanvasHeight)
    ditheringContext.fill()
	//draws the red
	let parity = true
    let baseParity = true
	for (let x = 0; x < ditheringCanvasWidth; x+=step) {
        for (let y = 0; y < ditheringCanvasHeight; y+=step) {
            if(parity){
                ditheringContext.beginPath()
                ditheringContext.fillStyle="#b72020"
                ditheringContext.rect(x,y,step,step)
                ditheringContext.fill()
            }
            parity=!parity
        }
        baseParity=!baseParity
        parity=baseParity
    }
}


//This gives every global variable its starting value
function resetDitheringValues(){
    ditheringCanvas.height = 512
    ditheringCanvas.width = ditheringCanvas.clientWidth
	ditheringCanvasHeight = ditheringCanvas.height
    ditheringCanvasWidth  = ditheringCanvas.width
}

//Declaration of all global variables
const ditheringCanvas  = document.getElementById("DitheringCanvas");			//The canvas element
const ditheringContext = ditheringCanvas.getContext("2d");			//The context of the canvas element
let ditheringCanvasHeight	//The height of the canvas element
let ditheringCanvasWidth		//The width of the canvas element

resetDitheringValues()
drawDitheringCanvas()

document.getElementById("DitheringInput").addEventListener("input",drawDitheringCanvas)
