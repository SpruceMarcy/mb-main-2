//Written by Marcy Brook

document.getElementById("VicGenerate").addEventListener("click",function(){
    let values=[]
    for(let y=0;y<8;y++){
        let total=0
        for(let x=0;x<8;x++){
            total+=(2**(7-x))*document.getElementById(x.toString()+y.toString()).checked
        }
        values[y]=total
    }
    document.getElementById("VicOutput").value="DATA "+values.join(",")
})

