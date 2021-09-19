//Written by Marcy Brook

//Calls all other drawing functions in the correct position and order
//x,y: the coordinates of the center of the bottom of the body
//height: the distance the legs rise above the floor
//color: the color of the animal's fur in the format "#rrggbb"
function drawAnimal(x,y,height,color){
	drawRainbow(x,y)
	context.beginPath()
	context.lineWidth=5
	//this calculates how far to the left the knee needs to be so that
	//the total length of each leg remains constant
	var kneeOffset=Math.sqrt(Math.pow(75,2)-Math.pow(height,2))/2
	//These are the two background legs
	drawLeg(x-50,y-5,height,kneeOffset,darken(color));
	drawLeg(x+40,y-5,height,kneeOffset,darken(color));
	drawBody(x,y,color)
	//These are the two foreground legs
	drawLeg(x-40,y,height,kneeOffset,color)
	drawLeg(x+50,y,height,kneeOffset,color)
	//drawNeck goes on to call drawHead
	drawNeck(x-55,y-25,color)
}
//Draws a rectangle with curved ends that represents the body
//x,y: coordinates of the center of the bottom of the body
function drawBody(x,y,color){
	context.strokeStyle=color;
	context.fillStyle=color;
	context.beginPath();
	//moveTo top right corner
	context.moveTo(x+50,y-50);
	//curveTo bottom right corner
	context.bezierCurveTo(x+75,y-50,x+75,y,x+50,y);
	//lineTo bottom left corner
	context.lineTo(x-50,y);
	//curveTo top left corner
	context.bezierCurveTo(x-75,y,x-75,y-50,x-50,y-50);
	//close the loop from the top left to right corners
	context.closePath();
	//draw the shape and fill it in
	context.stroke();
	context.fill();
}
//Draws a single leg consisting of 3 lines
//x,y: coordinates of the hip joint (top of leg)
//length: total height of the leg
//kneeOffset: how far to the left the knee is
function drawLeg(x,y,length,kneeOffset,color){
	context.lineWidth=10
	context.strokeStyle=color
	//this makes the corners of the line less pointy
	context.lineJoin="round"
	context.beginPath()
	//moveTo the top of the leg
	context.moveTo(x,y)
	//lineTo the knee
	context.lineTo(x-kneeOffset,y+length/2)
	//lineTo the ankle
	context.lineTo(x,y+length)
	//lineTo the end of the foot
	context.lineTo(x-10,y+length)
	//draw the leg
	context.stroke()
}
//Draws a line representing the neck, then draws a head at the end
//x,y: coordinates of the base of the neck
function drawNeck(x,y,color){
	//since the neck is just 1 line, it needs to be thick
	context.lineWidth=20
	context.strokeStyle=color
	//these coordinates determine where the neck goes to
	var headX = x-10
	var headY = y-70
	context.beginPath()
	//moveTo the base of the neck
	context.moveTo(x,y)
	//lineTo the top of the neck
	context.lineTo(headX,headY)
	//draw the neck
	context.stroke()
	//draw the head at the top of the neck
	drawHead(headX,headY,color)
}
//Draws a head using 3 shapes and 2 ears
//x,y: coordinates of the top of the neck
function drawHead(x,y,color){
	//This allows any translations of the canvas itself to be reverted
	context.save()
	//This moves the context such that the center of rotation is within the head
	//It also means that when drawing, you will need coordinates relative to x,y
	context.translate(x,y)
	//This rotates the context so that when the head is drawn it will be rotated
	context.rotate(headAngle)
	//draw the background ear
	drawEar(-5,1,darken(color))
	context.fillStyle=color
	context.strokeStyle=color
	context.beginPath()
	//draw a circle for the main head
	context.arc(-9,-1,18,0,2*Math.PI)
	context.fill()
	//draw the foreground ear
	drawEar(0,0,color)
	context.lineWidth=12
	//the face is a constant grey-ish color, so it is defined here
	context.fillStyle="#857060"
	context.strokeStyle="#857060"
	context.beginPath()
	//This path draws the face as a triangle with curved corners
	context.moveTo(-20,2)
	context.lineTo(-30,8)
	context.lineTo(-13,10)
	context.closePath()
	context.stroke()
	//the eye is a constant black color, so it is defined here
	context.fillStyle="#000000"
	context.beginPath()
	//draw a circle for the eye
	context.arc(-20,-1,3,0,2*Math.PI)
	context.fill()
	//this restores the context to its original state, removing transformations
	context.restore()
}
//Draws a small triangle to represent an ear
function drawEar(x,y,color){
	context.lineWidth=5
	context.fillStyle=color
	context.strokeStyle=color
	context.beginPath()
	//moveTo bottom left of the ear
	context.moveTo(x-10,y-17)
	//lineTo the top of the ear
	context.lineTo(x-6,y-25)
	//lineTo the bottom right of the ear
	context.lineTo(x-5,y-17)
	context.fill()
	context.stroke()
}
//Draws a rainbow as a set of differently colored arcs
function drawRainbow(x,y){
	//These are the colors in the rainbow:
	//             Red       Orange    Yellow    Green      Blue     Magenta
	var rbColors=["#FF0000","#FF8800","#FFFF00","#00FF00","#0000FF","#FF00FF"]
	//This is the thickness of a single band of color
	context.lineWidth=5
	//This draws an arc for each color in descending order (towards the center)
	for(var i=0;i<6;i++){
		//gets the color of this arc
		context.strokeStyle=rbColors[i]
		context.beginPath()
		//draws the arc. the radius is based on which arc it is.
		//rainbowStart and rainbowEnd are global variables for angles of the arc
		context.arc(x,y,150-(5*i),rainbowStart,rainbowEnd)
		context.stroke()
	}
}

//This takes a color and halves the first hex digit in each value, darkening it.
//only works on colors as a string in the format "#rrggbb" or "#rrggbbaa"
function darken(color){
	newcolor="#"
	for (var i=1; i<=5; i+=2){
		//parseInt(n,16) converts from hexadecimal to decimal
		newcolor=newcolor+(Math.round(parseInt(color[i],16)/2)).toString()
	}
	return newcolor
}

//draws the background over everything, clearing the canvas
function clearCanvas(){
	//draws the sky
	context.beginPath()
	context.fillStyle="#00F0FF"
	context.rect(0,0,canvasWidth,canvasHeight/2)
	context.fill()
	//draws the grass
	context.beginPath()
	context.fillStyle="#00A000"
	context.rect(0,canvasHeight/2,canvasWidth,canvasHeight/2)
	context.fill()
	//draws the sun
	context.beginPath()
	context.fillStyle="#FFFF00"
	context.arc(64,64,32,0,Math.PI*2)
	context.fill()
}

//This runs the animation logic
function update(){
	//This will move the end of the rainbow in an arc, before moving the start to follow.
	//The effect this will make should be the rainbow appearing from the left,
	//completing, then disappearing from the left.
	if (rainbowEnd<Math.PI*2){
		rainbowEnd+=Math.PI/100
	}
	else if (rainbowStart<Math.PI*2){
		rainbowStart+=Math.PI/100
	}
	
	//This if..else block determines what animation needs to happen based on the state
	//"if the animal is standing, then raise the body if it isn't raised already"
	if (animalState=="standing" && animalHeight<75){
		animalHeight+=1
	}
	//"if the animal is sitting, then lower the body if it isn't lowered already"
	else if(animalState=="sitting" && animalHeight>10){
		animalHeight-=1
	}
	//"if the animal is preparing a jump, move it into a crouching position"
	else if(animalState=="preparing jump"){
		if(animalHeight<42){
			animalHeight+=2
		}
		else if(animalHeight>45){
			animalHeight-=2
		}
		//This stops the animal jittering if the height is misaligned
		//this could occur if the uset starts a jump while the animal is moving
		else if(animalHeight!=44){
			animalHeight=44	
		}
		//Once this position has been reached, this will launch the jump
		else{
			animalState="launching jump"
		}
	}
	//This makes the animal stand up after lowering itself, as if launching a jump
	else if(animalState=="launching jump"){
		if(animalHeight<75){
			animalHeight+=2
		}
		//once the animal has raised itself, it will start moving
		else{
			animalState="jumping"
		}
	}
	//if the animal is in this state then it will move position
	else if(animalState=="jumping"){
		//"if the animal is supposed to be moving to the right, move it to the right"
		if(animalTargetX<animalX){
			//to stop jittering, it will move by 1/50th of the distance, or the rest of the way, whichever is smaller
			animalX-=Math.min(Math.abs(animalStartX-animalTargetX)/50,Math.abs(animalX-animalTargetX))
		}
		//"if the animal is supposed to be moving to the left, move it to the left"
		else if(animalTargetX>animalX){
			//to stop jittering, it will move by 1/50th of the distance, or the rest of the way, whichever is smaller
			animalX+=m=Math.min(Math.abs(animalStartX-animalTargetX)/50,Math.abs(animalX-animalTargetX))
		}
		//This will stop the jump once the animal has reached its destination
		if(animalTargetX==animalX){
			animalState="standing"
			//This makes sure the animal lands where it should in spite of rounding errors
			animalY=animalTargetY
		}
		else{
			//This depresses the height of the jump so that the animal remains onscreen
			var scaleFactor=150
			//This maths makes the animal follow a parabola between the start and end of the jump, making it follow a realistic path.
			animalY=(scaleFactor*animalStartY+(animalX-animalStartX)*(scaleFactor*(animalTargetY-animalStartY)/(animalTargetX-animalStartX)+animalX-animalTargetX))/scaleFactor
		}
	}
	
	//These move the seam where the angle jumps from pi/2 -> -3pi/2 to 3pi/2 -> -pi/2
	//This means that the animal will be able to tilt its head upwards instead
	//of tilting it downwards through its neck to look backwards
	if (headAngle<-Math.PI/2){
		headAngle+=Math.PI*2	
	}
	if (targetHeadAngle<-Math.PI/2){
		targetHeadAngle+=Math.PI*2	
	}
	
	//These adjust the direction the head's looking towards the target direction
	if (headAngle<targetHeadAngle-0.05){
		headAngle+=0.05
	}
	else if (headAngle>targetHeadAngle+0.05){
		headAngle-=0.05
	}
	//This will stop the head jittering if the exact angle isn't a multiple of 0.05
	else if (headAngle!=targetHeadAngle){
		headAngle=targetHeadAngle
	}
}

//This function recursively draws frames and updates everything; creating animation
function nextFrame(){
	requestID = requestAnimationFrame(nextFrame);
	update();
	clearCanvas()
	drawAnimal(animalX,animalY-animalHeight,animalHeight,animalColors[animalColorIndex]);
}

//This gives every global variable its starting value
function resetValues(){
	canvas1=document.getElementById("canvas1");
	context=canvas1.getContext("2d");
	canvasHeight=canvas1.height
	canvasWidth=canvas1.width
	animalHeight=75
	animalColors=["#802000","#D1C6BE","#FEB0CE"]
	animalColorIndex=0
	animalX=canvasWidth/2
	animalY=canvasHeight/2+50
	animalTargetX=0
	animalTargetY=0
	animalStartX=256
	animalStaryY=256
	animalState="standing"
	rainbowStart=Math.PI*2
	rainbowEnd=Math.PI*2
	headAngle=0
	targetHeadAngle=0
}

//Declaration of all global variables
var canvas1			//The canvas element
var context			//The context of the canvas element
var canvasHeight	//The height of the canvas element
var canvasWidth		//The width of the canvas element
var requestID		//Used in loading frames
var animalHeight	//The distance the animal's body is above the ground
var animalColors	//The possible colors of the animal
var animalColorIndex//The position of the current color in that array
var animalX			//The current X position of the animal
var animalY			//The current Y position of the animal
var animalStartX	//The X position of where the animal is jumping from
var animalStartY	//The Y position of where the animal is jumping from
var animalTargetX	//The X position of where the animal is jumping to
var animalTargetY	//The Y position of where the animal is jumping to
var animalState		//What the animal is currently doing
var rainbowStart	//The current angle at which the rainbow begins
var rainbowEnd		//The current angle at which the rainbow ends
var headAngle		//Which direction the head is looking at
var targetHeadAngle	//Which direction the head is rotating towards

resetValues()


canvas1.addEventListener("click",function(e){//This function is run whenever the canvas is clicked
	//gets the mouse coordinates relative to the top left of the canvas
	var boundingRect=canvas1.getBoundingClientRect()
	var mouseX=e.clientX-(boundingRect.left+(boundingRect.width-canvas1.width)/2)
	var mouseY=e.clientY-(boundingRect.top+(boundingRect.height-canvas1.height)/2)
	//If the sun is clicked, start the rainbow
	if (Math.pow(mouseX-64,2)+Math.pow(mouseY-64,2)<=Math.pow(32,2)){
		rainbowStart=Math.PI
		rainbowEnd=Math.PI
	}
	//otherwise if the sky is clicked, make the head look towards that position
	else if (mouseY<canvasHeight/2){
		//atan2 returns the angle between 0,0 and some coordinates. The mousepos
		//is adjusted so that it's position relative to the head is used instead
		targetHeadAngle=Math.atan2((animalX-65)-mouseX,(mouseY+95+animalHeight)-animalY)-Math.PI/2
	}
	//otherwise, the ground must be clicked, so start a jump towards that spot
	else{
		animalState="preparing jump"
		animalStartX=animalX
		animalStartY=animalY
		animalTargetX=mouseX
		animalTargetY=mouseY
	}
})
//When the "sit" button is clicked, tell the animal to sit
document.getElementById("sit").addEventListener("click",function(){
	//A check needs to be made so that the animal can't stop mid-air to sit
	if(animalState!="jumping"){
		animalState="sitting"
	}
})
//When the "stand" button is clicked, tell the animal to stand
document.getElementById("stand").addEventListener("click",function(){
	if(animalState!="jumping"){
		animalState="standing"
	}
})
//Set the color of the animal to the next one in the array of colors
document.getElementById("color").addEventListener("click",function(){
	animalColorIndex++
	//This loops the index back to the start of the array if the end is reached
	if(animalColorIndex>=3){
		animalColorIndex=0	
	}
})
//This makes the reset button set all the global values to their default value
document.getElementById("reset").addEventListener("click",resetValues)

//Starts the animation
nextFrame()