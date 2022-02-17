//Written by Marcy Brook
function runSarcasmConverter(){
    let text = document.getElementById("SarcasticInput").value
    let newText = ""
    text.split("").forEach(function(item){
        newText+=(Math.random() <= 0.5 ? item.toLowerCase() : item.toUpperCase())
    })
    document.getElementById("SarcasticOutput").value=newText
}
document.getElementById("SarcasticInput").addEventListener("input",runSarcasmConverter)
document.getElementById("SarcasticTranslate").addEventListener("click",runSarcasmConverter)