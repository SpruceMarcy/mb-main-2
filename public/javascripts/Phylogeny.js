//Written by Marcy Brook
//Copyright: the Unlicense

//======HELPER FUNCTIONS======
function $(e){return document.getElementById(e);}

function mod(x,n){
	return ((x%n) + n) %n
}

class PhylogenyInterface{
	constructor(canvas, canvasParent) {
		this.canvas = canvas
		this.context = canvas.getContext("2d");
		this.canvasParent = canvasParent
		this.resizeCanvas()
		this.scale         = 1.0;
		this.offset        = [0,0]
		this.generatedGrid = 0;
		this.isDragging    = false;
		this.showGrid 	   = true;
		this.collisionBoxes = []
		this.currentCollisionBox = null
		this.lastKnownMousePos = {x:0,y:0}
		this.canvas.addEventListener("wheel",this.handleScroll.bind(this),false);
		$("PhylogenyCanvasOverlay").style.fontSize = Math.floor(15*this.scale)+"px"
		this.canvas.addEventListener("mousedown",this.handleMouseDown.bind(this));
		this.canvas.addEventListener("mousemove",this.handleMouseMove.bind(this));
	}
	resizeCanvas(){
		this.canvas.height= this.canvasParent.offsetHeight;
		this.canvas.width = this.canvasParent.offsetWidth;
		this.canvasHeight = this.canvas.height;
		this.canvasWidth  = this.canvas.width;
	}
	resetView(){
		this.scale = 1.0;
		this.offset = [0,0]
		this.drawAll();
	}
	drawLine(x1,y1,x2,y2,width,colour){
		this.context.beginPath();
		this.context.strokeStyle=colour;
		this.context.lineWidth=Math.max(width*this.scale,1);
		this.context.moveTo(x1*this.scale,y1*this.scale);
		this.context.lineTo(x2*this.scale,y2*this.scale);
		this.context.closePath();
		this.context.stroke();
	}
	drawLocalLine(x1,y1,x2,y2,width,colour){
		this.context.beginPath();
		this.context.strokeStyle=colour;
		this.context.lineWidth=Math.max(width*this.scale,1);
		this.context.moveTo(x1*this.scale+this.offset[0],y1*this.scale+this.offset[1]);
		this.context.lineTo(x2*this.scale+this.offset[0],y2*this.scale+this.offset[1]);
		this.context.closePath();
		this.context.stroke();
	}
	drawLocalText(text,x,y){
		this.context.beginPath()
		//context.font = "30px Impact";
		this.context.font = Math.floor(15*this.scale).toString()+"px sanserif"
		this.context.fillStyle = "#FFFFFF"
		this.context.fillText( text, x*this.scale+this.offset[0], y*this.scale+this.offset[1] );
	}
	drawAll(){
		this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);
		if(this.showGrid){
			this.drawGrid();
		}
		loadJSON();
	}
	drawGrid(){
		for(let x=0;x<=this.canvasWidth/this.scale;x+=50){
			this.drawLine(
				x+(mod(this.offset[0]/this.scale,50)),0,
				x+(mod(this.offset[0]/this.scale,50)),this.canvasHeight/this.scale,
				1,"#434343");
		}
		for(let y=0;y<=this.canvasHeight/this.scale;y+=50){
			this.drawLine(
				0,y+(mod(this.offset[1]/this.scale,50)),
				this.canvasWidth/this.scale,y+(mod(this.offset[1]/this.scale,50)),
				1,"#434343");
		}
	}
	buildTree(tree,path=[]){
		tree["path"] = path
		let lineLength = 75
		let width = getTreeWidth(tree)
		if(tree.hasOwnProperty("taxa")) {
			let topWidth = tree["taxa"][0]["width"]
			let bottomWidth = tree["taxa"].slice(-1)[0]["width"]
			tree["verticalLineTop"] = (topWidth/2) - (width/2)
			tree["verticalLineBottom"] = (width/2) - (bottomWidth/2)
			let track = -(width/2)
			let pathTrack = 0
			for(let taxon of tree["taxa"]){
				let taxonWidth = getTreeWidth(taxon)
				taxon["yOffsetFromParent"] = track+taxonWidth/2
				track+=taxonWidth
				this.buildTree(taxon,path.concat([pathTrack]))
				pathTrack+=1
			}
			tree["nameXOffset"] = 5
			tree["nameYOffset"] = -5
		}else{
			tree["nameXOffset"] = 5+lineLength
			tree["nameYOffset"] = 5
		}
	}
	recursiveDraw(tree,x,y){
		let lineLength = 75
		let width = tree["width"]
		if(tree.hasOwnProperty("taxa")) {
			lineLength = 100
			if(tree["taxa"].length>1){
				this.drawLocalLine(
					x + lineLength,
					y + tree["verticalLineTop"],
					x + lineLength,
					y + tree["verticalLineBottom"],
					1, "#ffffff")
			}
			for(let taxon of tree["taxa"]){
				this.recursiveDraw(taxon,x+lineLength,y+taxon["yOffsetFromParent"])
			}
		}
		this.drawLocalText(tree["name"],x+tree["nameXOffset"],y+tree["nameYOffset"])
		this.drawLocalLine(x,y,x+lineLength,y,1,"#ffffff")
		this.collisionBoxes.push({
			x:x,
			y:y - width/2,
			width:lineLength,
			height:width,
			path:tree["path"]
		})
	}
	//Window -> interface
	convertToLocal(x,y){
		return {
			x: (x-this.offset[0])/this.scale,
			y: (y-this.offset[1])/this.scale
		}
	}
	//Interface -> window
	convertToGlobal(x,y){
		return {
			x: (x*this.scale)+this.offset[0],
			y: (y*this.scale)+this.offset[1]
		}
	}
	editNode(event){

	}
	addNode(event){
		let branch = getBranch(JSONTree,this.currentCollisionBox.path)
		if(!branch.hasOwnProperty("taxa")){
			branch["taxa"]=[]
		}
		branch["taxa"].push({name:"unnamed"})
		updateRawTree(JSONTree)
	}
	deleteNode(event){
		deleteBranch(JSONTree,this.currentCollisionBox.path)
		updateRawTree(JSONTree)
	}
	toggleGrid(event){
		this.showGrid = !this.showGrid
		if(this.showGrid) {
			$("PhylogenyToggleGrid").innerText = "# Hide Grid"
		}else{
			$("PhylogenyToggleGrid").innerText = "# Show Grid"
		}
		this.drawAll()
	}

	handleScroll(event){
		if(event.deltaY!==0){
			let oldScale   = this.scale
			this.scale     -= (event.deltaY ) * 0.06 * this.scale;
			this.scale      = this.scale > 0.5 ? this.scale : 0.5;
			this.scale      = this.scale < 20 ? this.scale : 20;
			let mousePos    = getMousePos(event,this.canvas);
			let centerX     = mousePos.x//this.canvasWidth/2
			let centerY     = mousePos.y//this.canvasHeight/2
			this.offset[0]  = (this.offset[0]-(centerX))*(this.scale/oldScale)+centerX;
			this.offset[1]  = (this.offset[1]-(centerY))*(this.scale/oldScale)+centerY;
			$("PhylogenyCanvasOverlay").style.fontSize = Math.floor(15*this.scale)+"px"
			this.canvas.dispatchEvent(new Event("mousemove"))
			this.drawAll()
			event.preventDefault();
		}
	}
	handleMouseDown(event){
		this.isDragging=true;
		this.dragOrigin=[event.clientX,event.clientY]
	}
	handleMouseMove(event){
		this.lastKnownMousePos = {x:event.clientX,y:event.clientY}
		if(this.isDragging){
			this.offset[0]+=(event.clientX-this.dragOrigin[0])
			this.offset[1]+=(event.clientY-this.dragOrigin[1])
			this.dragOrigin=[event.clientX,event.clientY];
			this.drawAll()
		}
		let mousePos = getMousePos(event,this.canvas)
		let localMousePos = this.convertToLocal(mousePos.x,mousePos.y)
		let canvasOverlay = $("PhylogenyCanvasOverlay")
		canvasOverlay.hidden = true
		this.currentCollisionBox = null
		for(let collisionBox of this.collisionBoxes){
			if(isInside(localMousePos,collisionBox)){
				canvasOverlay.hidden = false
				let localCanvasCoordinates = this.convertToGlobal( collisionBox.x ,(collisionBox.y + collisionBox.height/2))
				let lineAlignmentOffset = Math.max(this.scale,1)/2;
				canvasOverlay.style.top  = localCanvasCoordinates.y + lineAlignmentOffset + "px"
				canvasOverlay.style.left = localCanvasCoordinates.x + lineAlignmentOffset + "px"
				this.currentCollisionBox = collisionBox
			}
		}
	}
}

function getMousePos(event,canvas) {
	let rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}
function isInside(pos, rect){
	return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}
function removeScroll(event){
	event.preventDefault();
}
//======PROGRAM FUNCTIONS======
function loadJSON(){
	let tree1
	let tree2
	try{
		tree1 = JSON.parse($("PhylogenyRawTreePane").value)
		tree2 = JSON.parse($("PhylogenyRawTreePane").value)
		JSONTree = tree1
		phylogenyInterface.collisionBoxes = []
		phylogenyInterface.renderTree = tree2
		phylogenyInterface.buildTree(phylogenyInterface.renderTree)
		phylogenyInterface.recursiveDraw(phylogenyInterface.renderTree,75,phylogenyInterface.canvasHeight/2)
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
function getBranch(tree,path){
	if(path.length===0){
		return tree
	}
	return getBranch(tree["taxa"][path[0]],path.slice(1))
}
function deleteBranch(tree,path){
	if(path.length===1){
		if(tree["taxa"].length===1){
			delete tree["taxa"]
		}else {
			tree["taxa"].splice(path[0], 1)
		}
	}else{
		deleteBranch(tree["taxa"][path[0]],path.slice(1))
	}

}

//======INTERFACE FUNCTIONS======
function toggleTextArea(){
	let pane = $("PhylogenyRawTreePane")
	let togglePaneButton = $("PhylogenyToggleRawTreePane")
	pane.hidden = !pane.hidden
	togglePaneButton.innerText = "< Source"
	if(pane.hidden){
		togglePaneButton.innerText = "> Source"
	}
	updatePaneWidths()
}
function updatePaneWidths(){
	let phylogenyRawTreePane = $("PhylogenyRawTreePane")
	if( phylogenyRawTreePane.hidden){
		$("editorContainer").style.gridTemplateColumns = "25% 75%"
	}else{
		$("editorContainer").style.gridTemplateColumns = "0% 100%"
	}
	window.dispatchEvent(new Event("resize"))
}
function toggleFullScreen(){
	let elementsToBeHidden = Array.from(document.getElementsByTagName("header")).concat(Array.from(document.getElementsByTagName("breadcrumb-trail"))).concat(Array.from(document.getElementsByTagName("footer")))
	let pageTitle = $("PageTitle")
	elementsToBeHidden.push(pageTitle)
	let toHide = !pageTitle.hidden

	for(let e of elementsToBeHidden){
		e.hidden = toHide
	}
	if(toHide){
		$("content").style.maxWidth="100%";
		$("Phylogeny").style.marginTop="0";
		$("Phylogeny").style.marginBottom="0";
		$("Phylogeny").style.padding="0";
		$("editorContainer").style.margin="0"
		$("editorContainer").style.minHeight="99.9vh";
		window.scrollTo(0,0);
	}else{
		$("content").style=null;
		$("Phylogeny").style.marginTop=null;
		$("Phylogeny").style.marginBottom=null;
		$("Phylogeny").style.padding=null;
		$("editorContainer").style.margin="1em";
		$("editorContainer").style.minHeight=null;
	}
	window.dispatchEvent(new Event("resize"))
}
function resetTree(){
	if(confirm("Are you sure you want to reset the tree? This will delete all current work.")) {
		updateRawTree({name: ""})
	}
}
function updateRawTree(obj){
	let PhylogenyRawTreePlane = $("PhylogenyRawTreePane")
	PhylogenyRawTreePlane.value = JSON.stringify(obj,null,2)
	PhylogenyRawTreePlane.dispatchEvent(new Event("input"))
	loadJSON()
	let mouseMoveEvent = new Event("mousemove")
	mouseMoveEvent.clientX = phylogenyInterface.lastKnownMousePos.x
	mouseMoveEvent.clientY = phylogenyInterface.lastKnownMousePos.y
	phylogenyInterface.canvas.dispatchEvent(mouseMoveEvent)
}

/*
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
*/

//Declaration of all global variables
let phylogenyInterface = new PhylogenyInterface($("PhylogenyCanvas"),$("PhylogenyCanvasParent"))
let JSONTree = {}
loadJSON();

$("PhylogenyToggleRawTreePane").addEventListener("click",toggleTextArea)
$("PhylogenyToggleFullScreen").addEventListener("click",toggleFullScreen)
$("PhylogenyToggleGrid").addEventListener("click",phylogenyInterface.toggleGrid.bind(phylogenyInterface))
$("PhylogenyResetView").addEventListener("click",phylogenyInterface.resetView.bind(phylogenyInterface));
$("PhylogenyResetTree").addEventListener("click",resetTree);
$("PhylogenyRawTreePane").addEventListener("input",phylogenyInterface.drawAll.bind(phylogenyInterface),false);
$("PhylogenyEditNode").addEventListener("wheel",removeScroll)
$("PhylogenyEditNode").addEventListener("click",phylogenyInterface.editNode.bind(phylogenyInterface))
$("PhylogenyAddNode").addEventListener("wheel",removeScroll)
$("PhylogenyAddNode").addEventListener("click",phylogenyInterface.addNode.bind(phylogenyInterface))
$("PhylogenyDeleteNode").addEventListener("wheel",removeScroll)
$("PhylogenyDeleteNode").addEventListener("click",phylogenyInterface.deleteNode.bind(phylogenyInterface))
window.addEventListener('resize', function (){phylogenyInterface.resizeCanvas();phylogenyInterface.drawAll()}, false);
document.addEventListener("mouseup",function(){phylogenyInterface.isDragging=false});

phylogenyInterface.drawAll();