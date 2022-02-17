//Written by Marcy Brook
//Backend Code for JSAlpaca, a web project from my first year at uni.
//Interactive: https://mxmbrook.co.uk/tools/JSAlpaca
//Javascript:  https://mxmbrook.co.uk/javascripts/JSAlpaca.js
//License: Unlicense

class JSAlpaca{
	//Calls all drawing functions in the correct position and order
	//x,y: the coordinates of the center of the bottom of the body
	//height: the distance the legs rise above the floor
	//color: the color of the animal's fur in the format "#rrggbb"
	static drawAlpaca(x, y, height, color){
		JSAlpaca.drawRainbow(x,y)
		JSAlpaca.context.beginPath()
		JSAlpaca.context.lineWidth=5
		//this calculates how far to the left the knee needs to be so that
		//the total length of each leg remains constant
		let kneeOffset=Math.sqrt(Math.pow(75,2)-Math.pow(height,2))/2
		//These are the two background legs
		JSAlpaca.drawLeg(x-50,y-5,height,kneeOffset,JSAlpaca.darken(color));
		JSAlpaca.drawLeg(x+40,y-5,height,kneeOffset,JSAlpaca.darken(color));
		JSAlpaca.drawBody(x,y,color)
		//These are the two foreground legs
		JSAlpaca.drawLeg(x-40,y,height,kneeOffset,color)
		JSAlpaca.drawLeg(x+50,y,height,kneeOffset,color)
		//drawNeck goes on to call drawHead
		JSAlpaca.drawNeck(x-55,y-25,color)
	}
	//Draws a rectangle with curved ends that represents the body
	//x,y: coordinates of the center of the bottom of the body
	static drawBody(x,y,color){
		JSAlpaca.context.strokeStyle=color;
		JSAlpaca.context.fillStyle=color;
		JSAlpaca.context.beginPath();
		//moveTo top right corner
		JSAlpaca.context.moveTo(x+50,y-50);
		//curveTo bottom right corner
		JSAlpaca.context.bezierCurveTo(x+75,y-50,x+75,y,x+50,y);
		//lineTo bottom left corner
		JSAlpaca.context.lineTo(x-50,y);
		//curveTo top left corner
		JSAlpaca.context.bezierCurveTo(x-75,y,x-75,y-50,x-50,y-50);
		//close the loop from the top left to right corners
		JSAlpaca.context.closePath();
		//draw the shape and fill it in
		JSAlpaca.context.stroke();
		JSAlpaca.context.fill();
	}
	//Draws a single leg consisting of 3 lines
	//x,y: coordinates of the hip joint (top of leg)
	//length: total height of the leg
	//kneeOffset: how far to the left the knee is
	static drawLeg(x,y,length,kneeOffset,color){
		JSAlpaca.context.lineWidth=10
		JSAlpaca.context.strokeStyle=color
		//this makes the corners of the line less pointy
		JSAlpaca.context.lineJoin="round"
		JSAlpaca.context.beginPath()
		//moveTo the top of the leg
		JSAlpaca.context.moveTo(x,y)
		//lineTo the knee
		JSAlpaca.context.lineTo(x-kneeOffset,y+length/2)
		//lineTo the ankle
		JSAlpaca.context.lineTo(x,y+length)
		//lineTo the end of the foot
		JSAlpaca.context.lineTo(x-10,y+length)
		//draw the leg
		JSAlpaca.context.stroke()
	}
	//Draws a line representing the neck, then draws a head at the end
	//x,y: coordinates of the base of the neck
	static drawNeck(x,y,color){
		//since the neck is just 1 line, it needs to be thick
		JSAlpaca.context.lineWidth=20
		JSAlpaca.context.strokeStyle=color
		//these coordinates determine where the neck goes to
		let headX = x - 10;
		let headY = y - 70;
		JSAlpaca.context.beginPath()
		//moveTo the base of the neck
		JSAlpaca.context.moveTo(x,y)
		//lineTo the top of the neck
		JSAlpaca.context.lineTo(headX,headY)
		//draw the neck
		JSAlpaca.context.stroke()
		//draw the head at the top of the neck
		JSAlpaca.drawHead(headX,headY,color)
	}
	//Draws a head using 3 shapes and 2 ears
	//x,y: coordinates of the top of the neck
	static drawHead(x,y,color){
		//This allows any translations of the canvas itself to be reverted
		JSAlpaca.context.save()
		//This moves the context such that the center of rotation is within the head
		//It also means that when drawing, you will need coordinates relative to x,y
		JSAlpaca.context.translate(x,y)
		//This rotates the context so that when the head is drawn it will be rotated
		JSAlpaca.context.rotate(JSAlpaca.headAngle)
		//draw the background ear
		JSAlpaca.drawEar(-5,1,JSAlpaca.darken(color))
		JSAlpaca.context.fillStyle=color
		JSAlpaca.context.strokeStyle=color
		JSAlpaca.context.beginPath()
		//draw a circle for the main head
		JSAlpaca.context.arc(-9,-1,18,0,2*Math.PI)
		JSAlpaca.context.fill()
		//draw the foreground ear
		JSAlpaca.drawEar(0,0,color)
		JSAlpaca.context.lineWidth=12
		//the face is a constant grey-ish color, so it is defined here
		JSAlpaca.context.fillStyle="#857060"
		JSAlpaca.context.strokeStyle="#857060"
		JSAlpaca.context.beginPath()
		//This path draws the face as a triangle with curved corners
		JSAlpaca.context.moveTo(-20,2)
		JSAlpaca.context.lineTo(-30,8)
		JSAlpaca.context.lineTo(-13,10)
		JSAlpaca.context.closePath()
		JSAlpaca.context.stroke()
		//the eye is a constant black color, so it is defined here
		JSAlpaca.context.fillStyle="#000000"
		JSAlpaca.context.beginPath()
		//draw a circle for the eye
		JSAlpaca.context.arc(-20,-1,3,0,2*Math.PI)
		JSAlpaca.context.fill()
		//this restores the context to its original state, removing transformations
		JSAlpaca.context.restore()
	}
	//Draws a small triangle to represent an ear
	static drawEar(x,y,color){
		JSAlpaca.context.lineWidth=5
		JSAlpaca.context.fillStyle=color
		JSAlpaca.context.strokeStyle=color
		JSAlpaca.context.beginPath()
		//moveTo bottom left of the ear
		JSAlpaca.context.moveTo(x-10,y-17)
		//lineTo the top of the ear
		JSAlpaca.context.lineTo(x-6,y-25)
		//lineTo the bottom right of the ear
		JSAlpaca.context.lineTo(x-5,y-17)
		JSAlpaca.context.fill()
		JSAlpaca.context.stroke()
	}
	//Draws a rainbow as a set of differently colored arcs
	static drawRainbow(x,y){
		//These are the colors in the rainbow:
		//             Red       Orange    Yellow    Green      Blue     Magenta
		let rbColors = ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF"];
		//This is the thickness of a single band of color
		JSAlpaca.context.lineWidth=5
		//This draws an arc for each color in descending order (towards the center)
		for(let i=0; i<6; i++){
			//gets the color of this arc
			JSAlpaca.context.strokeStyle=rbColors[i]
			JSAlpaca.context.beginPath()
			//draws the arc. the radius is based on which arc it is.
			//rainbowStart and rainbowEnd are global variables for angles of the arc
			JSAlpaca.context.arc(x,y,150-(5*i),JSAlpaca.rainbowStart,JSAlpaca.rainbowEnd)
			JSAlpaca.context.stroke()
		}
	}

	//This takes a color and halves the first hex digit in each value, darkening it.
	//only works on colors as a string in the format "#rrggbb" or "#rrggbbaa"
	static darken(color){
		let newColor = "#"
		for (let i=1; i<=5; i+=2){
			//parseInt(n,16) converts from hexadecimal to decimal
			newColor=newColor+(Math.round(parseInt(color[i],16)/2)).toString()
		}
		return newColor
	}

	//draws the background over everything, clearing the canvas
	static clearCanvas(){
		//draws the sky
		JSAlpaca.context.beginPath()
		JSAlpaca.context.fillStyle="#00F0FF"
		JSAlpaca.context.rect(0,0,JSAlpaca.canvasWidth,JSAlpaca.canvasHeight/2)
		JSAlpaca.context.fill()
		//draws the grass
		JSAlpaca.context.beginPath()
		JSAlpaca.context.fillStyle="#00A000"
		JSAlpaca.context.rect(0,JSAlpaca.canvasHeight/2,JSAlpaca.canvasWidth,JSAlpaca.canvasHeight/2)
		JSAlpaca.context.fill()
		//draws the sun
		JSAlpaca.context.beginPath()
		JSAlpaca.context.fillStyle="#FFFF00"
		JSAlpaca.context.arc(64,64,32,0,Math.PI*2)
		JSAlpaca.context.fill()
	}

	//This runs the animation logic
	static update(){
		//This will move the end of the rainbow in an arc, before moving the start to follow.
		//The effect this will make should be the rainbow appearing from the left,
		//completing, then disappearing from the left.
		if (JSAlpaca.rainbowEnd<Math.PI*2){
			JSAlpaca.rainbowEnd+=Math.PI/100
		}
		else if (JSAlpaca.rainbowStart<Math.PI*2){
			JSAlpaca.rainbowStart+=Math.PI/100
		}

		//This if..else block determines what animation needs to happen based on the state
		//"if the animal is standing, then raise the body if it isn't raised already"
		if (JSAlpaca.animalState==="standing" && JSAlpaca.animalHeight<75){
			JSAlpaca.animalHeight+=1
		}
		//"if the animal is sitting, then lower the body if it isn't lowered already"
		else if(JSAlpaca.animalState==="sitting" && JSAlpaca.animalHeight>10){
			JSAlpaca.animalHeight-=1
		}
		//"if the animal is preparing a jump, move it into a crouching position"
		else if(JSAlpaca.animalState==="preparing jump"){
			if(JSAlpaca.animalHeight<42){
				JSAlpaca.animalHeight+=2
			}
			else if(JSAlpaca.animalHeight>45){
				JSAlpaca.animalHeight-=2
			}
			//This stops the animal jittering if the height is misaligned
			//this could occur if the user starts a jump while the animal is moving
			else if(JSAlpaca.animalHeight!==44){
				JSAlpaca.animalHeight=44
			}
			//Once this position has been reached, this will launch the jump
			else{
				JSAlpaca.animalState="launching jump"
			}
		}
		//This makes the animal stand up after lowering itself, as if launching a jump
		else if(JSAlpaca.animalState==="launching jump"){
			if(JSAlpaca.animalHeight<75){
				JSAlpaca.animalHeight+=2
			}
			//once the animal has raised itself, it will start moving
			else{
				JSAlpaca.animalState="jumping"
			}
		}
		//if the animal is in this state then it will move position
		else if(JSAlpaca.animalState==="jumping"){
			//"if the animal is supposed to be moving to the right, move it to the right"
			if(JSAlpaca.animalTargetX<JSAlpaca.animalX){
				//to stop jittering, it will move by 1/50th of the distance, or the rest of the way, whichever is smaller
				JSAlpaca.animalX-=Math.min(
					Math.abs(
						JSAlpaca.animalStartX-JSAlpaca.animalTargetX
					)/50,
					Math.abs(
						JSAlpaca.animalX-JSAlpaca.animalTargetX
					)
				)
			}
			//"if the animal is supposed to be moving to the left, move it to the left"
			else if(JSAlpaca.animalTargetX>JSAlpaca.animalX){
				//to stop jittering, it will move by 1/50th of the distance, or the rest of the way, whichever is smaller
				JSAlpaca.animalX+=Math.min(
					Math.abs(
						JSAlpaca.animalStartX-JSAlpaca.animalTargetX
					)/50,Math.abs(
						JSAlpaca.animalX-JSAlpaca.animalTargetX
					)
				)
			}
			//This will stop the jump once the animal has reached its destination
			if(JSAlpaca.animalTargetX===JSAlpaca.animalX){
				JSAlpaca.animalState="standing"
				//This makes sure the animal lands where it should in spite of rounding errors
				JSAlpaca.animalY=JSAlpaca.animalTargetY
			}
			else{
				//This depresses the height of the jump so that the animal remains onscreen
				let scaleFactor = 150;
				//This maths makes the animal follow a parabola between the start and end of the jump, making it follow a realistic path.
				JSAlpaca.animalY=(
					scaleFactor*JSAlpaca.animalStartY+(
						JSAlpaca.animalX-JSAlpaca.animalStartX
					)*(
						scaleFactor*(
							JSAlpaca.animalTargetY-JSAlpaca.animalStartY
						)/(
							JSAlpaca.animalTargetX-JSAlpaca.animalStartX
						)+JSAlpaca.animalX-JSAlpaca.animalTargetX
					)
				)/scaleFactor
			}
		}

		//These move the seam where the angle jumps from pi/2 -> -3pi/2 to 3pi/2 -> -pi/2
		//This means that the animal will be able to tilt its head upwards instead
		//of tilting it downwards through its neck to look backwards
		if (JSAlpaca.headAngle<-Math.PI/2){
			JSAlpaca.headAngle+=Math.PI*2
		}
		if (JSAlpaca.targetHeadAngle<-Math.PI/2){
			JSAlpaca.targetHeadAngle+=Math.PI*2
		}

		//These adjust the direction the head's looking towards the target direction
		if (JSAlpaca.headAngle<JSAlpaca.targetHeadAngle-0.05){
			JSAlpaca.headAngle+=0.05
		}
		else if (JSAlpaca.headAngle>JSAlpaca.targetHeadAngle+0.05){
			JSAlpaca.headAngle-=0.05
		}
		//This will stop the head jittering if the exact angle isn't a multiple of 0.05
		else if (JSAlpaca.headAngle!==JSAlpaca.targetHeadAngle){
			JSAlpaca.headAngle=JSAlpaca.targetHeadAngle
		}
	}

	//This function recursively draws frames and updates everything; creating animation
	static nextFrame(){
		JSAlpaca.requestID = requestAnimationFrame(JSAlpaca.nextFrame);
		JSAlpaca.update();
		JSAlpaca.clearCanvas()
		JSAlpaca.drawAlpaca(
			JSAlpaca.animalX,
			JSAlpaca.animalY-JSAlpaca.animalHeight,
			JSAlpaca.animalHeight,
			JSAlpaca.animalColors[JSAlpaca.animalColorIndex]
		);
	}

	//This gives every global variable its starting value
	static resetValues(){
		JSAlpaca.JSAlpacaCanvas=document.getElementById("JSAlpacaCanvas");
		JSAlpaca.context=JSAlpaca.JSAlpacaCanvas.getContext("2d");
		JSAlpaca.canvasHeight=JSAlpaca.JSAlpacaCanvas.height
		JSAlpaca.canvasWidth=JSAlpaca.JSAlpacaCanvas.width
		JSAlpaca.animalHeight=75
		JSAlpaca.animalColors=["#802000","#D1C6BE","#FEB0CE"]
		JSAlpaca.animalColorIndex=0
		JSAlpaca.animalX=JSAlpaca.canvasWidth/2
		JSAlpaca.animalY=JSAlpaca.canvasHeight/2+50
		JSAlpaca.animalTargetX=0
		JSAlpaca.animalTargetY=0
		JSAlpaca.animalStartX=256
		JSAlpaca.animalStartY=256
		JSAlpaca.animalState="standing"
		JSAlpaca.rainbowStart=Math.PI*2
		JSAlpaca.rainbowEnd=Math.PI*2
		JSAlpaca.headAngle=0
		JSAlpaca.targetHeadAngle=0
	}

	//Declaration of all static variables
	static JSAlpacaCanvas	//The canvas element
	static context			//The context of the canvas element
	static canvasHeight	//The height of the canvas element
	static canvasWidth		//The width of the canvas element
	static requestID		//Used in loading frames
	static animalHeight	//The distance the animal's body is above the ground
	static animalColors	//The possible colors of the animal
	static animalColorIndex//The position of the current color in that array
	static animalX			//The current X position of the animal
	static animalY			//The current Y position of the animal
	static animalStartX	//The X position of where the animal is jumping from
	static animalStartY	//The Y position of where the animal is jumping from
	static animalTargetX	//The X position of where the animal is jumping to
	static animalTargetY	//The Y position of where the animal is jumping to
	static animalState		//What the animal is currently doing
	static rainbowStart	//The current angle at which the rainbow begins
	static rainbowEnd		//The current angle at which the rainbow ends
	static headAngle		//Which direction the head is looking at
	static targetHeadAngle	//Which direction the head is rotating towards

	static main() {
		JSAlpaca.resetValues()
		JSAlpaca.JSAlpacaCanvas.addEventListener("click", function (e) {//This function is run whenever the canvas is clicked
			//gets the mouse coordinates relative to the top left of the canvas
			let boundingRect = JSAlpaca.JSAlpacaCanvas.getBoundingClientRect();
			let mouseX = e.clientX - (boundingRect.left + (boundingRect.width - JSAlpaca.JSAlpacaCanvas.width) / 2);
			let mouseY = e.clientY - (boundingRect.top + (boundingRect.height - JSAlpaca.JSAlpacaCanvas.height) / 2);
			//If the sun is clicked, start the rainbow
			if (Math.pow(mouseX - 64, 2) + Math.pow(mouseY - 64, 2) <= Math.pow(32, 2)) {
				JSAlpaca.rainbowStart = Math.PI
				JSAlpaca.rainbowEnd = Math.PI
			}
			//otherwise if the sky is clicked, make the head look towards that position
			else if (mouseY < JSAlpaca.canvasHeight / 2) {
				//atan2 returns the angle between 0,0 and some coordinates. The mouse pos
				//is adjusted so that it's position relative to the head is used instead
				JSAlpaca.targetHeadAngle = Math.atan2(
					JSAlpaca.animalX - 65 - mouseX,
					mouseY + 95 + JSAlpaca.animalHeight - JSAlpaca.animalY
				) - Math.PI / 2
			}
			//otherwise, the ground must be clicked, so start a jump towards that spot
			else {
				JSAlpaca.animalState = "preparing jump"
				JSAlpaca.animalStartX = JSAlpaca.animalX
				JSAlpaca.animalStartY = JSAlpaca.animalY
				JSAlpaca.animalTargetX = mouseX
				JSAlpaca.animalTargetY = mouseY
			}
		})
		//When the "sit" button is clicked, tell the animal to sit
		document.getElementById("JSAlpacaSit").addEventListener("click", function () {
			//A check needs to be made so that the animal can't stop mid-air to sit
			if (JSAlpaca.animalState !== "jumping") {
				JSAlpaca.animalState = "sitting"
			}
		})
		//When the "stand" button is clicked, tell the animal to stand
		document.getElementById("JSAlpacaStand").addEventListener("click", function () {
			if (JSAlpaca.animalState !== "jumping") {
				JSAlpaca.animalState = "standing"
			}
		})
		//Set the color of the animal to the next one in the array of colors
		document.getElementById("JSAlpacaColor").addEventListener("click", function () {
			JSAlpaca.animalColorIndex++
			//This loops the index back to the start of the array if the end is reached
			if (JSAlpaca.animalColorIndex >= 3) {
				JSAlpaca.animalColorIndex = 0
			}
		})
		//This makes the reset button set all the global values to their default value
		document.getElementById("JSAlpacaReset").addEventListener("click", JSAlpaca.resetValues)

		//Starts the animation
		JSAlpaca.nextFrame()
	}
}

JSAlpaca.main()