//Written by Marcy Brook. I'm so sorry.
//Copyright: the Unlicense. Feel free to copy.

function $(e){return document.getElementById(e);}
function uwuify(str){
    let r=[[,]]
    r.push([/[rl]/gi,"w"])
    r.push([/youw/gi,"ur"])
    r.push([/you/gi,"u"])
    r.push([/awe(?![a-z])/gi,"r"])
    r.push([/ove/gi,"uv"])
    r.push([/(n)([aeiou])/gi,"$1y$2"])
    for(let pair in r) {
        str=str.replace(r[pair][0], r[pair][1]);
    }
    return str
}

$("UwuTranslate").addEventListener("click",function(){
    $("UwuOutput").value = uwuify($("UwuInput").value)
})

$("UwuTranslateFaces").addEventListener("click",function(){
    let uwuText = uwuify($("UwuInput").value)
    const faces = [":3","(^³^)","uwu","OwO",":////",";-;;;",">.<"];
    let faceCount = Math.max(1,Math.round(uwuText.length/10)*Math.random());
    for(let i=faceCount;i>0;i--){
        let pivot = Math.floor(Math.random()*uwuText.length);
        uwuText = uwuText.substring(0,pivot)+(uwuText.substring(pivot)+" ").replace(" "," "+faces[Math.floor(Math.random()*faces.length)]+" ");
    }
    $("UwuOutput").value = uwuText
})