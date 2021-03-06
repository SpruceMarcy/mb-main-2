
//Matrix multiplication 3d visualisation
//Written by Marcy Brook
//Copyright waived as per the Unlicence
//==================ABSTRACTED FUNCTIONALITY==================//
function $(e){return document.getElementById(e)}
function makeCubes(text,sides,color){
var cubes = [];
sides.forEach((sideA)=>{
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: getTexture(text,color),
    side: sideA,
    opacity: sideA==THREE.FrontSide ? 0.85 : 0.25,
    transparent: true
});
    cubes.push(new THREE.Mesh(geometry, material));
});
    return cubes;
}
    function getTexture(text,color){
    text=Math.round(10*text)/10
    var c         = document.createElement('canvas');
    var g         = c.getContext('2d');
    c.width       = 100;
    c.height      = 100;
    g.fillStyle   = color;
    g.fillRect(0,0,c.width,c.height);
    g.fillStyle   = 'black';
    g.textAlign   = 'center';
    g.textBaseline= 'middle';
    g.font        = 'bold 100px Arial';
    var h         = 100;
    while(g.measureText(text).width>=100){
    h*=0.9;
    g.font='bold ' + h + 'px Arial';
}
    g.fillText(text,50,50+h/15);
    var texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
}
    class CubeStructure {
    constructor(text,color){
    this.cubes=makeCubes(text,[THREE.BackSide,THREE.FrontSide],color)
    this.color=0xffffff
    this.target=[0,0,0,0]
    this.value=text
}
    static fromMatrix(m,gap,color,centered,givenoffset,angle){
    var offset = [0.5+givenoffset[0],-0.5+givenoffset[1],0+givenoffset[2]];
    if(centered){
    offset[0] += (-m[0].length*(1+gap)+gap)/2
    offset[1] +=  (m.length*(1+gap)-gap)/2
}
    var returnval = [];
    for(let row in m){
    var returnrow = [];
    for(let e in m[row]){
    var tempCube = new CubeStructure(m[row][e],color)
    tempCube.setPos(e*(1+gap)+offset[0],-row*(1+gap)+offset[1],offset[2]);
    tempCube.rotate(angle);
    returnrow.push(tempCube);
}
    returnval.push([...returnrow]);
}
    return returnval;
}
    addToScene(localScene){
    localScene.add(this.cubes[0]);
    localScene.add(this.cubes[1]);
}
    setPos(x,y,z){
    this.cubes[0].position.x=x;
    this.cubes[0].position.y=y;
    this.cubes[0].position.z=z;
    this.cubes[1].position.x=x;
    this.cubes[1].position.y=y;
    this.cubes[1].position.z=z;
}
    rotate(angle){
    this.cubes[0].rotation.y=angle;
    this.cubes[1].rotation.y=angle;
}
    animateTo(x,y,z,frames){
    this.target=[x,y,z,frames]
}
    animate(){
    if(this.target[3]>0){
    var newx = this.cubes[0].position.x + (this.target[0]-this.cubes[0].position.x)/this.target[3]
    var newy = this.cubes[0].position.y + (this.target[1]-this.cubes[0].position.y)/this.target[3]
    var newz = this.cubes[0].position.z + (this.target[2]-this.cubes[0].position.z)/this.target[3]
    this.setPos(newx,newy,newz)
    this.target[3]-=1;
}
}
    select(){
    this.cubes[0].material.color.setHex(0xffff00)
    this.cubes[1].material.color.setHex(0xffff00)
}
    deselect(){
    this.cubes[0].material.color.setHex(0xffffff)
    this.cubes[1].material.color.setHex(0xffffff)
}
}
    function generateRandomMatrix(x,y){
    var returnval=[]
    for(var i=0; i<x; i++){
    var temprow=[]
    for(var j=0; j<y; j++){
    temprow.push(Math.random()*100)
}
    returnval.push([...temprow])
}
    return returnval
}
    function getInputMatrix(id,x,y){
    var returnval=[]
    for(var i=0; i<x; i++){
    var temprow=[]
    for(var j=0; j<y; j++){
    temprow.push($(id+j+"_"+i).value)
}
    returnval.push([...temprow])
}
    return returnval
}
    class CameraSuite {
    constructor(pos,tar,dist){
    this.ctar     = tar
    var givendist = 0
    givendist    += Math.pow(pos[0]-tar[0],2)
    givendist    += Math.pow(pos[1]-tar[1],2)
    givendist    += Math.pow(pos[2]-tar[2],2)
    givendist     = Math.sqrt(givendist)
    var ratio     = dist/givendist
    this.cpos     = [tar[0]+ratio*(pos[0]-tar[0]),
    tar[1]+ratio*(pos[1]-tar[1]),
    tar[2]+ratio*(pos[2]-tar[2])
    ]
    this.ttat     = this.ctar
    this.tpos     = this.cpos
    this.ttl      = 0
}
    animateTo(pos,tar,dist,ttl){
    this.ttar     = tar
    var givendist = 0
    givendist    += Math.pow(pos[0]-tar[0],2)
    givendist    += Math.pow(pos[1]-tar[1],2)
    givendist    += Math.pow(pos[2]-tar[2],2)
    givendist     = Math.sqrt(givendist)
    var ratio     = dist/givendist
    this.tpos     = [tar[0]+ratio*(pos[0]-tar[0]),
    tar[1]+ratio*(pos[1]-tar[1]),
    tar[2]+ratio*(pos[2]-tar[2])
    ]
    this.tdist    = dist
    this.ttl      = ttl
}
    animate(){
    if(this.ttl>0){
    this.ctar[0] = this.ctar[0] + (this.ttar[0]-this.ctar[0])/this.ttl
    this.ctar[1] = this.ctar[1] + (this.ttar[1]-this.ctar[1])/this.ttl
    this.ctar[2] = this.ctar[2] + (this.ttar[2]-this.ctar[2])/this.ttl
    this.cpos[0] = this.cpos[0] + (this.tpos[0]-this.cpos[0])/this.ttl
    this.cpos[1] = this.cpos[1] + (this.tpos[1]-this.cpos[1])/this.ttl
    this.cpos[2] = this.cpos[2] + (this.tpos[2]-this.cpos[2])/this.ttl

    var givendist = 0
    givendist    += Math.pow(this.cpos[0]-this.ctar[0],2)
    givendist    += Math.pow(this.cpos[1]-this.ctar[1],2)
    givendist    += Math.pow(this.cpos[2]-this.ctar[2],2)
    givendist     = Math.sqrt(givendist)
    var ratio     = this.tdist/givendist
    this.cpos     = [this.ctar[0]+ratio*(this.cpos[0]-this.ctar[0]),
    this.ctar[1]+ratio*(this.cpos[1]-this.ctar[1]),
    this.ctar[2]+ratio*(this.cpos[2]-this.ctar[2])
    ]

    this.ttl-=1;
}
}
}
    //==================INITIALISATION==================//
    var camera = new THREE.PerspectiveCamera(75,1,0.1,1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio*2);
    renderer.setSize(480,480);
    $("demoarea").appendChild(renderer.domElement);

    var scene
    var m1cubes
    var m2cubes
    var m3cubes
    var m4cubes
    var dlight
    var hlight
    var m1v
    var m12
    var m2v
    var animateset
    var lastanimateset
    var calculateset
    var mainCam

    function initialise(){
    m1v              = $("m1v").value
    m12              = $("m12").value
    m2v              = $("m2v").value
    animateset       = [0,0,0,-1]
    lastanimateset   = [0,0,0]
    calculateset     = [0,0,-1]
    lastcalculateset = [0,0]
    scene            = new THREE.Scene();
    scene.background = new THREE.Color('white');
    mainCam          = new CameraSuite([0.125,0,1],[0.125,0,0],2*Math.max(m1v,m12,m2v))
    $("c1").checked=true;
    m1cubes=CubeStructure.fromMatrix(getInputMatrix("i",m1v,m12),0.25,'#8888dd',true,[(-m12*(1.25)+0.25)/2,0,0],0)
    for(let row in m1cubes){
    for(let c in m1cubes[row]){
    m1cubes[row][c].addToScene(scene);
}
}

    m2cubes=CubeStructure.fromMatrix(getInputMatrix("j",m12,m2v),0.25,'#88dd88',true,[(m2v*(1.25)+0.25)/2,0,0],Math.PI/2)
    for(let row in m2cubes){
    for(let c in m2cubes[row]){
    m2cubes[row][c].addToScene(scene);
}
}

    m3cubes = new Array(+m1v);
    for(var a = 0; a < m1v; a++){
    m3cubes[a] = new Array(+m12);
    for(var b = 0; b < m12; b++){
    m3cubes[a][b] = new Array(+m2v);
}
}

    m4cubes = new Array(+m1v);
    for(var a = 0; a < m1v; a++){
    m4cubes[a] = new Array(+m2v);
}

    dlight = new THREE.DirectionalLight(0xFFFFFF,1);
    dlight.position.set(1,0.7,0.3);
    scene.add(dlight);
    hlight = new THREE.HemisphereLight(0xFFFFFF,0x111111,1);
    scene.add(hlight);
    $("1,2").disabled=false
    $("2,3").disabled=true
    $("3,4").disabled=true
}
    initialise()
    function inputsetup(){
    m1v = $("m1v").value
    m12 = $("m12").value
    m2v = $("m2v").value
    for(var x = 0; x < 4; x++){
    for(var y = 0; y < 4; y++){
    $("i"+y+"_"+x).disabled=(x>m1v-1||y>m12-1)
}
}
    for(var x = 0; x < 4; x++){
    for(var y = 0; y < 4; y++){
    $("j"+y+"_"+x).disabled=(x>m12-1||y>m2v-1)
}
}
}
    inputsetup()
    $("reset").addEventListener("click",initialise)
    $("m1v").addEventListener("input",inputsetup)
    $("m12").addEventListener("input",inputsetup)
    $("m2v").addEventListener("input",inputsetup)
    $("ac").addEventListener("input",function(){
    var c = $("ac").checked
    $("c1").disabled=c
    $("c2").disabled=c
    $("c3").disabled=c
    $("c4").disabled=c
})
    $("c1").addEventListener("input",c1)
    $("c2").addEventListener("input",c2)
    $("c3").addEventListener("input",c3)
    $("c4").addEventListener("input",c4)
    function c1(){mainCam.animateTo([0.125,0,1],[0.125,0,0],2*Math.max(m1v,m12,m2v),60)}
    function c2(){mainCam.animateTo([-m12/2+1,1,-m2v/2+1],[-m12/2,0,-m2v/2],2*Math.max(m1v,m12,m2v),60)}
    function c3(){mainCam.animateTo([-m12/2+1,-1,-m2v/2-1],[-m12/2,0,-m2v/2],2*Math.max(m1v,m12,m2v),60)}
    function c4(){mainCam.animateTo([1,0,-m2v/1.5],[0,0,-m2v/1.5],2*Math.max(m1v,m12,m2v),60)}
    //==================FUNCTIONALITY==================//

    function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

    $("populate").addEventListener("click",function(){

    for(var x = 0; x < 4; x++){
    for(var y = 0; y < 4; y++){
    var thisInput1 = $("i"+y+"_"+x);
    var thisInput2 = $("j"+y+"_"+x);
    if(!thisInput1.disabled){
    thisInput1.value = getRndInteger(0,10);
}
    if(!thisInput2.disabled){
    thisInput2.value = getRndInteger(0,10);
}
}
}
})

    $("1,2").addEventListener("click",function(){
    if($("ac").checked){$("c2").checked=true;c2()}
    for(let row in m2cubes){
    for(let c in m2cubes[row]){
    m2cubes[row][c].animateTo(-0.5-(m2cubes.length-row-1)*(1.25),(m1v)*(1.25)/2+0.625,-1.25-c*(1.25),60);
}
}
    $("1,2").disabled=true
    $("2,3").disabled=false
    $("3,4").disabled=true
})
    $("2,3").addEventListener("click",function(){
    if($("ac").checked){$("c3").checked=true;c3()}
    animateset=[0,0,0,60];
    $("1,2").disabled=true
    $("2,3").disabled=true
    $("3,4").disabled=true
})
    $("3,4").addEventListener("click",function(){
    if($("ac").checked){$("c4").checked=true;c4()}
    calculateset=[0,0,45];
    $("1,2").disabled=true
    $("2,3").disabled=true
    $("3,4").disabled=true
})
    function animate(){
    requestAnimationFrame(animate);
    update();
    renderer.render(scene,camera);
}
    animate();

    function update(){
    mainCam.animate()
    camera.position.x=mainCam.cpos[0]
    camera.position.y=mainCam.cpos[1]
    camera.position.z=mainCam.cpos[2]
    camera.lookAt(new THREE.Vector3(mainCam.ctar[0],mainCam.ctar[1],mainCam.ctar[2]));
    for(let row in m2cubes){
    for(let c in m2cubes[row]){
    m2cubes[row][c].animate();
}
}
    if(animateset[3]>=0){
    animateset[3]-=1;
    if(animateset[3]<=0){
    m1cubes[lastanimateset[0]][lastanimateset[1]].deselect()
    m2cubes[lastanimateset[1]][lastanimateset[2]].deselect()
    if(m3cubes[lastanimateset[0]][lastanimateset[1]][lastanimateset[2]])
{m3cubes[lastanimateset[0]][lastanimateset[1]][lastanimateset[2]].deselect()}
    if(animateset[1]!=-1){
    lastanimateset[0]=animateset[0]
    lastanimateset[1]=animateset[1]
    lastanimateset[2]=animateset[2]
    var newval = m1cubes[animateset[0]][animateset[1]].value*m2cubes[animateset[1]][animateset[2]].value
    m1cubes[animateset[0]][animateset[1]].select()
    m2cubes[animateset[1]][animateset[2]].select()
    if(!m3cubes[animateset[0]][animateset[1]][animateset[2]])
{m3cubes[animateset[0]][animateset[1]][animateset[2]] = new CubeStructure(newval,'#ffffff')}
    m3cubes[animateset[0]][animateset[1]][animateset[2]].addToScene(scene)
    m3cubes[animateset[0]][animateset[1]][animateset[2]].setPos(-0.5-(m12-animateset[1]-1)*(1.25),
    ((m1v/2-animateset[0])*1.25)-0.625,
    -1.25-1.25*animateset[2])
    m3cubes[animateset[0]][animateset[1]][animateset[2]].select()
    animateset[3]=5+800/(m12*m1v*m2v+32)
    animateset[0]+=1
    if(animateset[0]>=m1v){animateset[0]=0;animateset[2]+=1}
    if(animateset[2]>=m2v){animateset[2]=0;animateset[1]+=1}
    if(animateset[1]>=m12){animateset[1]=-1;$("3,4").disabled=false}
}
}
}
    if(calculateset[2]>=0){
    calculateset[2]-=1;
    if(calculateset[2]<=0){
    for(let i in m3cubes[0]){
    m3cubes[lastcalculateset[0]][i][lastcalculateset[1]].deselect()
}
    if(m4cubes[lastcalculateset[0]][lastcalculateset[1]])
{m4cubes[lastcalculateset[0]][lastcalculateset[1]].deselect()}
    if(calculateset[0]!=-1){
    lastcalculateset[0]=calculateset[0]
    lastcalculateset[1]=calculateset[1]
    var newval = 0
    for(let i in m3cubes[0]){
    m3cubes[lastcalculateset[0]][i][lastcalculateset[1]].select()
    newval+=m3cubes[lastcalculateset[0]][i][lastcalculateset[1]].value
}
    if(!m4cubes[calculateset[0]][calculateset[1]])
{m4cubes[calculateset[0]][calculateset[1]] = new CubeStructure(newval,'#dd8888')}
    m4cubes[calculateset[0]][calculateset[1]].addToScene(scene)
    m4cubes[calculateset[0]][calculateset[1]].setPos(0.75,
    (m1v*(1.25)-0.25)/2-(calculateset[0]*1.25)-0.5,
    -1.25-1.25*calculateset[1])
    m4cubes[calculateset[0]][calculateset[1]].select()
    calculateset[2]=5+800/(m1v*m2v+32)
    calculateset[1]+=1
    if(calculateset[1]>=m2v){calculateset[1]=0;calculateset[0]+=1}
    if(calculateset[0]>=m1v){calculateset[0]=-1}
}
}
}
}