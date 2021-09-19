//Written by Marcy Brook
function run(){
    text=document.getElementById("input").value
    newtext=""
    text.split("").forEach(function(item){
        newtext+=(Math.random() <= 0.5 ? item.toLowerCase() : item.toUpperCase())
    })
    document.getElementById("output").value=newtext
}
input.addEventListener("keyup",run)
document.getElementById("translate").addEventListener("click",run)