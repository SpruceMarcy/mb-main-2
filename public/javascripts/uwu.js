//Written by Marcy Brook. I'm so sorry.
function uwuify(str){
    r=[[,]]
    r.push([/[rl]/gi,"w"])
    r.push([/youw/gi,"ur"])
    r.push([/you/gi,"u"])
    r.push([/awe(?![a-z])/gi,"r"])
    r.push([/ove/gi,"uv"])
    r.push([/(n)([aeiou])/gi,"$1y$2"])
    for(var pair in r) {
        str=str.replace(r[pair][0], r[pair][1]);
    }
    return str
}

document.getElementById("translate").addEventListener("click",function(){
    text=uwuify(document.getElementById("input").value)
    document.getElementById("output").value=text
})

document.getElementById("translatef").addEventListener("click",function(){
    uwuText=uwuify(document.getElementById("input").value)
    
    faces=[":3","(^³^)","uwu","OwO",":////",";-;;;",">.<"];
    facecount=Math.max(1,Math.round(uwuText.length/10)*Math.random());
    for(var i=facecount;i>0; i--){
        pivot=Math.floor(Math.random()*uwuText.length);
        uwuText=uwuText.substring(0,pivot)+(uwuText.substring(pivot)+" ").replace(" "," "+faces[Math.floor(Math.random()*faces.length)]+" ");
    }
    
    document.getElementById("output").value=uwuText
})