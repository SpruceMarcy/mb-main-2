//written by Marcy Brook
function textToCssObject(text){
    var text1
    do{
        text1=text
        text=text.replace(/(\r\n|\n|\r)/gm,"")
        text=text.replace(/(\t|  )/gm," ")
    } while (text1!=text)
    
    var pointer1=0
    var pointer2=0
    var tempSelector=""
    var selectors=[]
    var rules=[]
    var cssOb={}
    while(pointer2<text.length){
        if(text[pointer2]=="{"){
            selectors=text.substring(pointer1,pointer2).split(",")
            for(var selector in selectors){
                selectors[selector]=selectors[selector].trim()
            }
            pointer1=pointer2+1
        }
        if(text[pointer2]=="}"){
            rules=text.substring(pointer1,pointer2).replace(/;+ *$/m, "").split(";")
            for(var rule in rules){
                rules[rule]=rules[rule].split(":")
                rules[rule]=rules[rule][0].trim()+":"+(rules[rule][1].trim())
            }
            for(let selector of selectors){
                if(typeof cssOb[selector] == 'undefined'){
                    cssOb[selector]=[]
                }
                for(let rule of rules){
                    cssOb[selector].push(rule)  
                }
            }
            pointer1=pointer2+1
        }
        pointer2++
    }
    return cssOb   
}
function cssObjectToText(cssOb){
    var text=""
    for(var selector in cssOb){
        text+=selector
        text+="{\n"
        for(var rule in cssOb[selector]){
            text+="\t"+cssOb[selector][rule]+";\n"
        }
        text+="}\n"
    }
    return text
}
function compareCssObjects(cssOb1,cssOb2){
    var c1={}
    var intersect={}
    for(var selector1 in cssOb1){
        if(typeof cssOb2[selector1] != 'undefined'){
            for(var rule1 in cssOb1[selector1]){
                var isUnique=true
                for(var rule2 in cssOb2[selector1]){
                    if(cssOb1[selector1][rule1]==cssOb2[selector1][rule2]){
                        addRuleToCssObject(intersect,selector1,cssOb1[selector1][rule1])
                        isUnique=false
                    }
                }
                if(isUnique){
                    addRuleToCssObject(c1,selector1,cssOb1[selector1][rule1])
                }
            }
        }
        else{
            for(var rule1 in cssOb1[selector1]){
                addRuleToCssObject(c1,selector1,cssOb1[selector1][rule1])
            }
        }
    }
    return [c1,intersect]
}
function addRuleToCssObject(cssOb, selector, rule){
    if(typeof cssOb[selector] == 'undefined'){
        cssOb[selector]=[]
    }
    cssOb[selector].push(rule)  
}
function subtractCssObjects(cssOb1,cssOb2){
    var c1={}
    for(var selector1 in cssOb1){
        if(typeof cssOb2[selector1] != 'undefined'){
            for(var rule1 in cssOb1[selector1]){
                var isUnique=true
                for(var rule2 in cssOb2[selector1]){
                    if(cssOb1[selector1][rule1]==cssOb2[selector1][rule2]){
                        isUnique=false
                    }
                }
                if(isUnique){
                    addRuleToCssObject(c1,selector1,cssOb1[selector1][rule1])
                }
            }
        }
        else{
            for(var rule1 in cssOb1[selector1]){
                addRuleToCssObject(c1,selector1,cssOb1[selector1][rule1])
            }
        }
    }
    return c1
}
document.getElementById("compare").addEventListener("click",function(){
    output=""
    try{
        css1=textToCssObject(document.getElementById("input1").value)
        css2=textToCssObject(document.getElementById("input2").value)
        comparison=compareCssObjects(css1,css2)
        if(document.getElementById("c1").checked){
            output=cssObjectToText(comparison[0])
        }
        if(document.getElementById("intersection").checked){
            output=cssObjectToText(textToCssObject(output+cssObjectToText(comparison[1])))
        }
        if(document.getElementById("c2").checked){
            output=cssObjectToText(textToCssObject(output+cssObjectToText(subtractCssObjects(css2,comparison[1]))))
        }
        if(output==""){
            output="No rules found"
        }
        if(!(document.getElementById("c1").checked||document.getElementById("intersection").checked||document.getElementById("c2").checked)){
            output="No selection made"
        }
    }
    catch(err){
        output=err+"\n\nPlease report this error at http://mxmbrook.co.uk/contact along with a brief description of what happened when it occurred."
    }
    document.getElementById("output").value=output
})