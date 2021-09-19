//Written by Marcy Brook
//Copyright: the Unlicense

//======HELPER FUNCTIONS======
function $(e){return document.getElementById(e);}
function drawLine(x1,y1,x2,y2,width,colour){
	context.beginPath();
	context.strokeStyle=colour;
	context.lineWidth=width*scale;
	context.moveTo(x1*scale,y1*scale);
        context.lineTo(x2*scale,y2*scale);
	context.closePath();
	context.stroke();
}
function drawPolygon(points,fill){
	context.fillStyle=fill;
	context.beginPath();
	context.moveTo(points[0][0]*scale+offset[0],points[0][1]*scale+offset[1]);
	for(let point in points){
		context.lineTo(points[point][0]*scale+offset[0],points[point][1]*scale+offset[1]);
	}
	context.closePath();
	context.fill();
}
function improvisePolygon(point1,point2,lowerXbound,lowerYbound,targetX,targetY){
	var upperXbound = lowerXbound+1
	var midX        = lowerXbound+0.5
	var midpX       = (point1[0]+point2[0])/2
	var upperYbound = lowerYbound+1
	var midY        = lowerYbound+0.5
	var midpY       = (point1[1]+point2[1])/2

	var points=[point1,
		    point2,
		    [lowerXbound,lowerYbound],
		    [upperXbound,lowerYbound],
		    [upperXbound,upperYbound],
		    [lowerXbound,upperYbound]]
	var A = Math.atan2(point1[0]-midpX,point1[1]-midpY)
	//drawLine(20*point1[0],20*point1[1],20*midpX,20*midpY,1,"#00ff00")
	var B = Math.atan2(targetX-midpX,targetY-midpY)
	//drawLine(20*targetX,20*targetY,20*midpX,20*midpY,1,"#000000")
	var C = Math.atan2(point2[0]-midpX,point2[1]-midpY)
	//drawLine(20*point2[0],20*point2[1],20*midpX,20*midpY,1,"#00ff00")
	if(B<=A){B+=2*Math.PI}
	if(C<=A){C+=2*Math.PI}
	if(A<=B && B<=C){
		points.sort(function(a,b){
			return (Math.atan2(a[0]-midX,a[1]-midY)) - (Math.atan2(b[0]-midX,b[1]-midY))
		})
	}
	else {
		points.sort(function(a,b){
			return (Math.atan2(b[0]-midX,b[1]-midY)) - (Math.atan2(a[0]-midX,a[1]-midY))
		})
	}
	var polygon = new Array(0)
	var index = 0
	var record = false
	while(true){
		point=points[index]
		if(point[0]==point1[0] && point[1]==point1[1]){
			record = true;
		}
		if(record){
			polygon.push([point[0]*20,point[1]*20])
		}
		if(record && point[0]==point2[0] && point[1]==point2[1]){
			break
		}
		index+=1
		if(index>=points.length){
			index=0
		}
	}
	
	return polygon
}
function weightedEDist(x1,y1,x2,y2,wx,wy){
	var hcomp = ((x1-x2)/wx)**2
	var vcomp = ((y1-y2)/wy)**2
	return Math.sqrt(hcomp+vcomp)
}
function eclipses(x1,y1,x2,y2,wx,wy){
	return  true &&
		weightedEDist(x1,y1,x2+0.5,y2+0.5,wx,wy) < 0.5 &&
		weightedEDist(x1,y1,x2-0.5,y2+0.5,wx,wy) < 0.5 &&
		weightedEDist(x1,y1,x2+0.5,y2-0.5,wx,wy) < 0.5 &&
		weightedEDist(x1,y1,x2-0.5,y2-0.5,wx,wy) < 0.5;
}
function pushOrPop(array, value){
	for(let i in array){
		if(array[i][0]==value[0] &&
		   array[i][1]==value[1]){
			return;
		}
	}
	array.push(value)
}
//======PROGRAM FUNCTIONS======
function drawAll(){
	context.clearRect(0,0,canvasWidth,canvasHeight);
	if(generatedGrid==0){calculateAnew()}
	for(var x = 0; x < generatedGrid.length; x++){
		for(var y = 0; y < generatedGrid[x].length; y++){
			if(generatedGrid[x][y]=="Center"){
				drawPolygon([[20*x,20*y],
				     [20*x+20,20*y],
                                     [20*x+20,20*y+20],
                                     [20*x,20*y+20]],"#ff0000");
			}
			else if(generatedGrid[x][y]=="Outside"||generatedGrid[x][y].length<2){
				drawPolygon([[20*x,20*y],
				     [20*x+20,20*y],
                                     [20*x+20,20*y+20],
                                     [20*x,20*y+20]],"#CCCCCCcc");
			}
			else{
				//drawLine(20*generatedGrid[x][y][0][0],20*generatedGrid[x][y][0][1],
                                //         20*generatedGrid[x][y][1][0],20*generatedGrid[x][y][1][1],1.5,"#0000ff")
				var color = "#0000ff88"
				//if(Math.abs(generatedGrid[x][y][0][0]-generatedGrid[x][y][1][0])==0.5 && 					   Math.abs(generatedGrid[x][y][0][1]-generatedGrid[x][y][1][1])==0.5 &&
				//   weightedEDist((generatedGrid[x][y][0][0]+generatedGrid[x][y][1][0])/2,
				//		 (generatedGrid[x][y][0][1]+generatedGrid[x][y][1][1])/2,
				//		 generatedGrid.length/2,
				//		 generatedGrid[0].length/2,1,1)>
				//   weightedEDist(x+0.5,y+0.5,
				//		 generatedGrid.length/2,
				//		 generatedGrid[0].length/2,1,1)){
				//	color = "#ff000088"
				//}
				drawPolygon(improvisePolygon(generatedGrid[x][y][0],
						 generatedGrid[x][y][1],
						 x,y,
						 generatedGrid.length/2,generatedGrid[0].length/2),color);
			}
		}
	}
	drawGrid();
}

function drawGrid(){
        for(var x=0;x<=canvasWidth/scale;x+=20){
		drawLine(x+((offset[0]/scale)%20),0,x+((offset[0]/scale)%20),canvasHeight/scale,1.5,"#888888");
	}
        for(var y=0;y<=canvasHeight/scale;y+=20){
		drawLine(0,y+((offset[1]/scale)%20),canvasWidth/scale,y+((offset[1]/scale)%20),1.5,"#888888");
	}
}

function calculateAnew(){
        var arrayWidth  = 2+Math.ceil($("widthbox").value);
	var arrayHeight = 2+Math.ceil(getHeightInput());
	var midpoint    = {"x":arrayWidth/2-0.5,"y":arrayHeight/2-0.5};
	generatedGrid   = new Array(arrayWidth);
	for(var i = 0; i<arrayWidth; i++){
		generatedGrid[i] = new Array(arrayHeight);
		for(var j = 0; j<arrayHeight; j++){
			generatedGrid[i][j] = "Outside";
		}
	}
	if(Number.isInteger(midpoint["x"])){
		if(Number.isInteger(midpoint["y"])){
			generatedGrid[midpoint["x"]][midpoint["y"]]="Center";
		}
		else{
			generatedGrid[midpoint["x"]][Math.ceil(midpoint["y"])]="Center";
			generatedGrid[midpoint["x"]][Math.floor(midpoint["y"])]="Center";
		}
	}
	else{
		if(Number.isInteger(midpoint["y"])){
			generatedGrid[Math.ceil(midpoint["x"])][midpoint["y"]]="Center";
			generatedGrid[Math.floor(midpoint["x"])][midpoint["y"]]="Center";
		}
		else{
			generatedGrid[Math.ceil(midpoint["x"])][Math.ceil(midpoint["y"])]="Center";
			generatedGrid[Math.ceil(midpoint["x"])][Math.floor(midpoint["y"])]="Center";
			generatedGrid[Math.floor(midpoint["x"])][Math.ceil(midpoint["y"])]="Center";
			generatedGrid[Math.floor(midpoint["x"])][Math.floor(midpoint["y"])]="Center";
		}
	}
	var midpointactualx = arrayWidth/2
	var midpointactualy = arrayHeight/2
	for(var x = 1; x < arrayWidth; x++){
		var dy = getHeightInput() * Math.sqrt((0.5)**2-((x-midpointactualx)/$("widthbox").value)**2)
		var y1 = midpointactualy + dy
		var y2 = midpointactualy - dy
		var cya1 = Math.floor(y1)
		var cya2 = Math.floor(y2)
		var cyb1 = Math.ceil(y1-1)
		var cyb2 = Math.ceil(y2-1)

		if(typeof generatedGrid[x-1][cya1]=="string"){generatedGrid[x-1][cya1]=new Array(0)}
		pushOrPop(generatedGrid[x-1][cya1],[x,Math.round(y1*2)/2])
		if(typeof generatedGrid[x][cya1]=="string"){generatedGrid[x][cya1]=new Array(0)}
		pushOrPop(generatedGrid[x][cya1],[x,Math.round(y1*2)/2])
		if(typeof generatedGrid[x-1][cya2]=="string"){generatedGrid[x-1][cya2]=new Array(0)}
		pushOrPop(generatedGrid[x-1][cya2],[x,Math.round(y2*2)/2])
		if(typeof generatedGrid[x][cya2]=="string"){generatedGrid[x][cya2]=new Array(0)}
		pushOrPop(generatedGrid[x][cya2],[x,Math.round(y2*2)/2])

		if(typeof generatedGrid[x-1][cyb1]=="string"){generatedGrid[x-1][cyb1]=new Array(0)}
		pushOrPop(generatedGrid[x-1][cyb1],[x,Math.round(y1*2)/2])
		if(typeof generatedGrid[x][cyb1]=="string"){generatedGrid[x][cyb1]=new Array(0)}
		pushOrPop(generatedGrid[x][cyb1],[x,Math.round(y1*2)/2])
		if(typeof generatedGrid[x-1][cyb2]=="string"){generatedGrid[x-1][cyb2]=new Array(0)}
		pushOrPop(generatedGrid[x-1][cyb2],[x,Math.round(y2*2)/2])
		if(typeof generatedGrid[x][cyb2]=="string"){generatedGrid[x][cyb2]=new Array(0)}
		pushOrPop(generatedGrid[x][cyb2],[x,Math.round(y2*2)/2])
	}
	for(var y = 1; y < arrayHeight; y++){
		var dx = $("widthbox").value * Math.sqrt((0.5)**2-((y-midpointactualy)/getHeightInput())**2)
		var x1 = midpointactualx + dx
		var x2 = midpointactualx - dx
		var cxa1 = Math.floor(x1)
		var cxa2 = Math.floor(x2)
		var cxb1 = Math.ceil(x1-1)
		var cxb2 = Math.ceil(x2-1)

		if(typeof generatedGrid[cxa1][y-1]=="string"){generatedGrid[cxa1][y-1]=new Array(0)}
		pushOrPop(generatedGrid[cxa1][y-1],[Math.round(x1*2)/2,y])
		if(typeof generatedGrid[cxa1][y]=="string"){generatedGrid[cxa1][y]=new Array(0)}
		pushOrPop(generatedGrid[cxa1][y],[Math.round(x1*2)/2,y])
		if(typeof generatedGrid[cxa2][y-1]=="string"){generatedGrid[cxa2][y-1]=new Array(0)}
		pushOrPop(generatedGrid[cxa2][y-1],[Math.round(x2*2)/2,y])
		if(typeof generatedGrid[cxa2][y]=="string"){generatedGrid[cxa2][y]=new Array(0)}
		pushOrPop(generatedGrid[cxa2][y],[Math.round(x2*2)/2,y])

		if(typeof generatedGrid[cxb1][y-1]=="string"){generatedGrid[cxb1][y-1]=new Array(0)}
		pushOrPop(generatedGrid[cxb1][y-1],[Math.round(x1*2)/2,y])
		if(typeof generatedGrid[cxb1][y]=="string"){generatedGrid[cxb1][y]=new Array(0)}
		pushOrPop(generatedGrid[cxb1][y],[Math.round(x1*2)/2,y])
		if(typeof generatedGrid[cxb2][y-1]=="string"){generatedGrid[cxb2][y-1]=new Array(0)}
		pushOrPop(generatedGrid[cxb2][y-1],[Math.round(x2*2)/2,y])
		if(typeof generatedGrid[cxb2][y]=="string"){generatedGrid[cxb2][y]=new Array(0)}
		pushOrPop(generatedGrid[cxb2][y],[Math.round(x2*2)/2,y])
	}
	
}

//======INTERFACE FUNCTIONS======
function handleTypeSelection(){
	$("heightoptions").hidden=$("selectcircle").checked;
}
function getHeightInput(){
	return $("selectcircle").checked ? $("widthbox").value : $("heightbox").value;
}
function entangle(el1, el2){
	el1.addEventListener("input",function(){
		el2.value=el1.value;
	})
	el2.addEventListener("input",function(){
		el1.value=el2.value;
	})
}
function generate(){
	calculateAnew();
	drawAll();
}
function resetView(){
	scale = 1.0;
	offset = [0,0]
	drawAll();
}
function handleScroll(event){
	oldscale   = scale
	scale     -= (event.deltaY / Math.abs(event.deltaY)) * 0.2;
	scale      = scale > 0.5 ? scale : 0.5;
	scale      = scale < 20 ? scale : 20;
	offset[0]  = (offset[0]-256)*(scale/oldscale)+256
	offset[1]  = (offset[1]-256)*(scale/oldscale)+256
	drawAll()
	event.preventDefault();
}

//======BASE FUNCTIONS======
//This function recursively draws frames
function nextFrame(){
	requestID = requestAnimationFrame(nextFrame);
	drawAll()
}

//This gives every global variable its starting value
function resetValues(){
	canvas1       = $("canvas1");
	context       = canvas1.getContext("2d");
	canvasHeight  = canvas1.height;
	canvasWidth   = canvas1.width;
	scale         = 1.0;
	offset        = [0,0]
	gridOrigin    = {"x":0,"y":0}
	generatedGrid = 0;
	isDragging    = false;
}

//Declaration of all global variables
var canvas1			//The canvas element
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

resetValues();

$("selectcircle").addEventListener("change",handleTypeSelection);
$("selectellipse").addEventListener("change",handleTypeSelection);
entangle($("widthslider"),$("widthbox"));
entangle($("heightslider"),$("heightbox"));
$("gen").addEventListener("click",generate);
$("widthslider").addEventListener("input",generate);
$("widthbox").addEventListener("input",generate);
$("heightslider").addEventListener("input",generate);
$("heightbox").addEventListener("input",generate);
$("selectcircle").addEventListener("change",generate);
$("selectellipse").addEventListener("change",generate);
$("resetview").addEventListener("click",resetView);
$("canvas1").addEventListener("wheel",handleScroll,false);
$("canvas1").addEventListener("mousedown",function(e){isDragging=true;dragOrigin=[e.clientX,e.clientY]})
$("canvas1").addEventListener("mousemove",function(e){if(isDragging){
	offset[0]+=e.clientX-dragOrigin[0]
	offset[1]+=e.clientY-dragOrigin[1]
	dragOrigin=[e.clientX,e.clientY];
	drawAll()
}})
document.addEventListener("mouseup",function(){isDragging=false})

handleTypeSelection();
generate();
//nextFrame();
