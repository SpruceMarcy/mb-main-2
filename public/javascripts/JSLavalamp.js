class Lava {
    constructor(canvas,bounds) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')
        this.blobs = []
        this.bounds = bounds
        this.bounds.addEventListener("click",requestFullscreen)
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.rescale()
        window.addEventListener('resize', this.rescale.bind(this))
        this.draw()
    }
    rescale() {
        this.canvas.width=this.bounds.clientWidth;
        this.canvas.height=this.bounds.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    update(){
        if (this.blobs.length<10){
            if(this.blobs.length<1||randomInt(100)<1){
                this.blobs.push(new Blob({x:randomInt(this.width),y:randomInt(1)*(this.height-2)+1}, "#00A000", this.height, 5))
            }
        }
        for (let i = 0; i < this.blobs.length; i++) {
            const b = this.blobs[i]
            b.update()
        }
        for (let i = 0; i < this.blobs.length; i++) {
            if (this.blobs[i].isDead({x:this.width,y:this.height})) {
                this.blobs.splice(i, 1)
                --i
            }
        }
    }
    draw() {
        this.update()
        this.ctx.clearRect(0, 0, this.width, this.height)
        for (let i = 0; i < this.blobs.length; i++) {
            const b = this.blobs[i]
            b.draw(this.ctx)
        }
        this.ctx.beginPath()
        this.ctx.ellipse(this.width/2,0,this.width/2,this.height/10,0,0, 2 * Math.PI)
        this.ctx.ellipse(this.width/2,this.height,this.width/2,this.height/10,0,0, 2 * Math.PI)
        this.ctx.fill()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

class Blob {
    constructor(origin, color, height, goal) {
        this.xPos = origin.x
        this.yPos = origin.y
        this.velo = -((this.yPos/height)-0.5)/5
        this.lampHeight = height
        this.colo = color
        this.goal = (5 + Math.random() * 9) * goal
        this.radi = 0.1
    }

    update() {
        if(this.goal && this.radi<this.goal){
            this.radi +=0.5
        }else{
            this.goal = false
            this.radi = Math.max(this.radi-0.02,0)
            this.yPos += this.velo
            if(this.yPos<(this.lampHeight/2)){
                this.velo+=0.001
            }else{
                this.velo-=0.001
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.colo
        ctx.beginPath()
        ctx.arc(this.xPos, this.yPos, this.radi, Math.PI * 2, false)
        ctx.fill()
    }

    isDead(size) {
        return (
            this.yPos <= 0 ||
            this.yPos >= size.yPos ||
            this.r <= 0
        )
    }
}

function randomInt(v) {
    return Math.floor(Math.random() * (v + 1))
}

new Lava(document.getElementById("LavalampCanvas"),document.getElementById("LavalampBounds"))

function requestFullscreen(e){
    let el = e.currentTarget
    if(el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
    else {
        el.mozRequestFullScreen();
    }
}

