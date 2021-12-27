//Written by Marcy Brook
//Copyright: the Unlicense

//======HELPER FUNCTIONS======
function $(e){return document.getElementById(e);}
function convertToLocal(x,y){
	return {
		x: (x-offset[0])/scale,
		y: (y-offset[1])/scale
	}
}
function convertToGlobal(x,y){
	return {
		x: (x*scale)+offset[0],
		y: (y*scale)+offset[1]
	}
}
function drawLine(x1,y1,x2,y2,width,colour){
	context.beginPath();
	context.strokeStyle=colour;
	context.lineWidth=Math.max(width*scale,1);
	context.moveTo(x1*scale,y1*scale);
	context.lineTo(x2*scale,y2*scale);
	context.closePath();
	context.stroke();
}
function drawLocalLine(x1,y1,x2,y2,width,colour){
	context.beginPath();
	context.strokeStyle=colour;
	context.lineWidth=Math.max(width*scale,1);
	context.moveTo(x1*scale+offset[0],y1*scale+offset[1]);
	context.lineTo(x2*scale+offset[0],y2*scale+offset[1]);
	context.closePath();
	context.stroke();
}
function drawLocalText(text,x,y){
	context.beginPath()
	//context.font = "30px Impact";
	context.font = (15*scale).toString()+"px sanserif"
	context.fillStyle = "#FFFFFF"
	context.fillText( text, x*scale+offset[0], y*scale+offset[1] );

}
function mod(x,n){
	return ((x%n) + n) %n
}
function getMousePos(event) {
	let rect = canvas1.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}
function isInside(pos, rect){
	return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}
//======PROGRAM FUNCTIONS======
function loadJSON(){
	let tree
	try{
		tree = JSON.parse($("rawTree").value)
		collisionBoxes = []
		recursiveDraw(tree,75,canvasHeight/2)
	}catch (e) {

	}
}

function getTreeWidth(tree){
	if(tree.hasOwnProperty("width")){
		return tree["width"]
	}else if(tree.hasOwnProperty("taxa")){
		let width = 0
		for(let taxon of tree["taxa"]){
			width += getTreeWidth(taxon)
		}
		tree["width"] = width
		return width
	}else{
		let defaultWidth = 35
		tree["width"] = defaultWidth
		return defaultWidth
	}
}

function recursiveDraw(tree,x,y){
	let lineLength = 75
	let width = getTreeWidth(tree)
	if(tree.hasOwnProperty("taxa")) {
		lineLength = 100
		let topWidth = getTreeWidth(tree["taxa"][0])
		let bottomWidth = getTreeWidth(tree["taxa"].slice(-1)[0])
		if(width != topWidth){
			drawLocalLine(
				x + lineLength,
				y - (width/2) + (topWidth/2),
				x + lineLength,
				y + (width/2) - (bottomWidth/2),
				1, "#ffffff")
		}
		let track = y - (width/2)
		for(let taxon of tree["taxa"]){
			let taxonWidth = getTreeWidth(taxon)
			recursiveDraw(taxon,x+lineLength,track+taxonWidth/2)
			track+=taxonWidth
		}
		drawLocalText(tree["name"],x+5,y-5)
	}else{
		drawLocalText(tree["name"],x+5+lineLength,y+5)
	}
	drawLocalLine(x,y,x+lineLength,y,1,"#ffffff")
	collisionBoxes.push({
		x:x,
		y:y - width/2,
		width:lineLength,
		height:width
	})
}

function drawAll(){
	context.clearRect(0,0,canvasWidth,canvasHeight);

	drawGrid();
	loadJSON();
}

function drawGrid(){
	for(var x=0;x<=canvasWidth/scale;x+=50){
		drawLine(
			x+(mod(offset[0]/scale,50)),0,
			x+(mod(offset[0]/scale,50)),canvasHeight/scale,
			1,"#434343");
	}
    for(var y=0;y<=canvasHeight/scale;y+=50){
		drawLine(
			0,y+(mod(offset[1]/scale,50)),
			canvasWidth/scale,y+(mod(offset[1]/scale,50)),
			1,"#434343");
	}
}

//======INTERFACE FUNCTIONS======
function toggleTextArea(){
	if( $("rawTree").hidden){
		$("rawTree").hidden = false
		$("editorContainer").style.gridTemplateColumns = "30% 70%"
		$("toggletextarea").innerText = "< Source"
	}else{
		$("rawTree").hidden = true
		$("toggletextarea").innerText = "> Source"
		$("editorContainer").style.gridTemplateColumns = "0% 100%"
	}
	window.dispatchEvent(new Event("resize"))
}
function resetView(){
	scale = 1.0;
	offset = [0,0]
	drawAll();
}
function resetTree(){
	if(confirm("Are you sure you want to reset the tree? This will delete all current work.")) {
		updateRawTree({name: ""})
	}
}
function updateRawTree(obj){
	$("rawTree").value = JSON.stringify(obj,null,2)
	$("rawTree").dispatchEvent(new Event("input"))

}
function handleScroll(event){
	if(event.deltaY!=0){
		oldscale   = scale
		scale     -= (event.deltaY / Math.abs(event.deltaY)) * 0.02 * scale;
		scale      = scale > 0.5 ? scale : 0.5;
		scale      = scale < 20 ? scale : 20;
		centerX    = canvasWidth/2
		centerY    = canvasHeight/2
		offset[0]  = (offset[0]-(centerX))*(scale/oldscale)+centerX;
		offset[1]  = (offset[1]-(centerY))*(scale/oldscale)+centerY;
		$("editNode").style.fontSize = (15*scale)+"px"
		canvas1.dispatchEvent(new Event("mousemove"))
		drawAll()
		drawReticule()
		event.preventDefault();
	}
}
function drawReticule(){
	centerX    = canvasWidth/2
	centerY    = canvasHeight/2
	context.fillStyle="#1ea71e";
	points = [
		[centerX-1,centerY-1],
		[centerX+1,centerY-1],
		[centerX+1,centerY+1],
		[centerX-1,centerY+1]
	]
	context.beginPath();
	context.moveTo(points[0][0],points[0][1]);
	for(let point in points){
		context.lineTo(points[point][0],points[point][1]);
	}
	context.closePath();
	context.fill();
}

//======BASE FUNCTIONS======
//This function recursively draws frames
//function nextFrame(){
//	requestID = requestAnimationFrame(nextFrame);
//	drawAll()
//}

//This gives every global variable its starting value
function resetValues(){
	canvas1       = $("canvas1");
	canvasParent  = $("canvasParent")
	context       = canvas1.getContext("2d");
	resizeCanvas()
	scale         = 1.0;
	offset        = [0,0]
	gridOrigin    = {"x":0,"y":0}
	generatedGrid = 0;
	isDragging    = false;
	collisionBoxes = []
}

function resizeCanvas(){
	canvas1.height= canvasParent.offsetHeight;
	canvas1.width = canvasParent.offsetWidth;
	canvasHeight  = canvas1.height;
	canvasWidth   = canvas1.width;
}

//Declaration of all global variables
var canvas1			//The canvas element
var canvasParent    //The canvas parent Div
var context			//The context of the canvas element
var canvasHeight	        //The height of the canvas element
var canvasWidth		        //The width of the canvas element
var requestID		        //Used in loading frames
var scale	                //The zoom level
var offset			//The drag offset
var gridOrigin			//The offset for parity
var generatedGrid		//The final product, as an array
var isDragging			//The state of the canvas movement
var dragOrigin			//The position the drag started
var collisionBoxes

resetValues();
loadJSON();

$("toggletextarea").addEventListener("click",toggleTextArea)
$("resetview").addEventListener("click",resetView);
$("resettree").addEventListener("click",resetTree);
$("rawTree").addEventListener("input",drawAll,false);
$("canvas1").addEventListener("wheel",handleScroll,false);
$("canvas1").addEventListener("mousedown",function(e){isDragging=true;dragOrigin=[e.clientX,e.clientY]});
$("canvas1").addEventListener("mousemove",function(e){
	if(isDragging){
		offset[0]+=(e.clientX-dragOrigin[0])
		offset[1]+=(e.clientY-dragOrigin[1])
		dragOrigin=[e.clientX,e.clientY];
		drawAll()
	}
	let mousePos = getMousePos(e)
	let localMousePos = convertToLocal(mousePos.x,mousePos.y)
	let canvasOverlay = $("canvasOverlay")
	canvasOverlay.hidden = true
	for(let collisionBox of collisionBoxes){
		if(isInside(localMousePos,collisionBox)){
			canvasOverlay.hidden = false
			let localCanvasCoordinates = convertToGlobal( collisionBox.x ,(collisionBox.y + collisionBox.height/2))
			canvasOverlay.style.top  = localCanvasCoordinates.y + "px"
			canvasOverlay.style.left = localCanvasCoordinates.x + "px"
		}
	}
});
window.addEventListener('resize', function (){resizeCanvas();drawAll()}, false);
document.addEventListener("mouseup",function(){isDragging=false});

drawAll();
