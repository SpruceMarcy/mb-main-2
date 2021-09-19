//Written by Marcy Brook

document.getElementById("generate").addEventListener("click",function(){
    var values=[]
    for(y=0;y<8;y++){
        var total=0
        for(x=0;x<8;x++){
            total+=(2**(7-x))*document.getElementById(x.toString()+y.toString()).checked
        }
        values[y]=total
    }
    document.getElementById("output").value="DATA "+values.join(",")
})

