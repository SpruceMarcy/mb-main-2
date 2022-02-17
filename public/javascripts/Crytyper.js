//Written by Marcy Brook
//Conceptual design originally by Rebecca Turner

function crytype(str,effect){
    str = str.replace("sorry","so sorry")
    let r = [[,,,]]
    r.push([/^(.)(.)/gi,   true, "$2$1",                       0.08,0])
    r.push([/^(.)/gi,      false,"abcdefghijklmnopqrstuvwxyz ",0.01,0])
    r.push([/^(.)/gi,      true, "$1$1",                       0.1 ,1])
    r.push([/^(.)/gi,      false,",, .;",                      0.06,1])
    r.push([/^([\.,; ])/gi,true, "$1$1",                       0.3, 1])
    r.push([/^(.)/gi,      true, "",                           0.01,-1])
    for(let set of r) {
        let i = 0
        while(i < str.length){
            if(Math.random() <= set[3] * effect){
                if(set[1]){
                    str = str.substring(0,i)+str.substring(i,str.length).replace(set[0], set[2]);
                }
                else{
                    str = str.substring(0,i)+str.substring(i,str.length).replace(set[0], "$1"+set[2].charAt(Math.floor(Math.random() * set[2].length)))
                }
                i += set[4]
            }
            i++
        }
    }
    return str
}
function updateCrytyper(){
    let text = crytype(
        document.getElementById("CrytyperInput").value,
        document.getElementById("CrytyperMagnitude").value/100
    )
    document.getElementById("CrytyperOutput").value=text
}

document.getElementById("CrytyperInput").addEventListener("input",updateCrytyper)
document.getElementById("CrytyperTranslate").addEventListener("click",updateCrytyper)
document.getElementById("CrytyperMagnitude").addEventListener("input",updateCrytyper)