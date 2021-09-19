class Lava {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.blobs = []
    this.rescale()
    window.addEventListener('resize', this.rescale.bind(this))

    this.draw()
  }

  rescale() {
    console.log("resized")
    canvas.width=container.clientWidth
    canvas.height=container.clientHeight
    width = canvas.width;
    height = canvas.height;
  }
  update(){
      if (this.blobs.length<10){
          if(this.blobs.length<1||randomInt(100)<1){
              this.blobs.push(new Blob({x:randomInt(width),y:randomInt(1)*(height-2)+1}, colour, 5))
          }
      }
      for (let i = 0; i < this.blobs.length; i++) {
          const b = this.blobs[i]
          b.update()
      }
      for (let i = 0; i < this.blobs.length; i++) {
          if (this.blobs[i].dead({x:width,y:height})) {
            this.blobs.splice(i, 1)
            --i
          }
      }
  }
  draw() {
    this.update()
    this.ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < this.blobs.length; i++) {
      const b = this.blobs[i]
      b.draw(this.ctx, 5)
    }
    this.ctx.beginPath()
    this.ctx.ellipse(width/2,0,width/2,height/10,0,0, 2 * Math.PI)
    this.ctx.ellipse(width/2,height,width/2,height/10,0,0, 2 * Math.PI)
    this.ctx.fill()
    
    window.requestAnimationFrame(this.draw.bind(this))
  }

  unhook() {
    window.removeEventListener('resize', this.rescale)
  }
}

class Blob {
  constructor(origin, color, goal) {
    this.x = origin.x
    this.y = origin.y
    this.v = -((this.y/height)-0.5)/5
    this.c = color
    this.goal=(5 + Math.random() * 9) * goal
    this.r = 0.1
  }

  update() {

    if(this.r<this.goal){
        this.r+=0.5
    }
    else{
        this.goal=-1
        this.r = Math.max(this.r-0.02,0)
        this.y += this.v
        if(this.y<(height/2)){
            this.v+=0.001
        }
        else{
            this.v-=0.001
        }
    }
    

  }

  draw(ctx) {
    ctx.fillStyle = this.c
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false)
    ctx.fill()
  }

  dead(size) {
    return (
      this.y <= 0 ||
      this.y >= size.y ||
      this.r <= 0
    )
  }
}

function randomInt(v) {
  return Math.floor(Math.random() * (v + 1))
}

var canvas = document.getElementById("canvas1")
var container = document.getElementById("canvasbounds")
var width = canvas.width;
var height = canvas.height;
var colour = "#00AA00";
new Lava(canvas)

function fullscreen(){
           var el = document.getElementById('canvasbounds');
 
           if(el.webkitRequestFullScreen) {
               el.webkitRequestFullScreen();
           }
          else {
             el.mozRequestFullScreen();
          }            
}
 
canvas.addEventListener("click",fullscreen)