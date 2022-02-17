//Written by Marcy Brook
//Backend Code for JSBean, a sarcastic rip-off of a friend's ML project.
//Interactive: https://mxmbrook.co.uk/tools/JSBean
//Javascript:  https://mxmbrook.co.uk/javascripts/JSBean.js
//License: Unlicense

class JSBean{
    static playerElement = document.getElementById("JSBeanPlayer");
    static output = document.getElementById("JSBeanGuess");
    static context = document.getElementById("JSBeanCanvas").getContext("2d");

    static gradient = JSBean.context.createLinearGradient(-175, 175, -225, 225);

    //These numbers are technically copyrighted under CC BY 4.0
    //Source: https://www.kaggle.com/freddyheppell/gourmet-jellybean-images
    //Owner: Freddy Heppell
    //This data has been modified from the source
    static beanData={
        "Banana Split":[123,118,57],
        "Blueberry Pie":[15,95,96],
        "Butterscotch":[103,63,8],
        "Candyfloss":[124,60,78],
        "Caramel":[124,112,75],
        "Chilli":[55,0,3],
        "Coffee":[53,5,1],
        "Cola":[86,31,5],
        "Cranberry and Apple":[113,0,1],
        "French Vanilla":[144,137,114],
        "Granny Smith Apple":[5,65,23],
        "Grape":[40,0,5],
        "Lemon and Lime":[77,77,6],
        "Liquorice":[37,11,17],
        "Mango":[107,55,3],
        "Marshmallow":[34,48,29],
        "Mint Sorbet":[59,69,94],
        "Peachy Pie":[126,23,3],
        "Pear":[75,103,61],
        "Pina Colada":[148,115,19],
        "Pink Grapefruit":[139,65,23],
        "Sour Lemon":[164,153,25],
        "South Seas Kiwi":[107,111,59],
        "Strawberry":[99,0,6],
        "Strawberry Smoothie":[105,2,19],
        "Tangerine":[127,40,3],
        "Tropical Punch":[151,141,116],
        "Watermelon":[23,81,3],
        "Wild Cherry":[4,1,13]
    }

    static main(){
        JSBean.gradient.addColorStop(0, "magenta");
        JSBean.gradient.addColorStop(1.0, "blue");
        JSBean.context.scale(-1,1);
        navigator.mediaDevices.getUserMedia({video:{width: 400,height: 400}}).then((function(stream) {
            JSBean.playerElement.srcObject = stream;
            setInterval(JSBean.g, 5)
        }))
    }

    static classify(color){
        let rankings=[]
        let total=0
        for(let i = 0; i < Object.keys(JSBean.beanData).length; i++){
            let key = Object.keys(JSBean.beanData)[i]
            let value = JSBean.beanData[key]
            rankings[i]=[
                100/Math.sqrt(
                    Math.pow(
                        value[0]-color[0],
                        2
                    )+Math.pow(
                        value[1]-color[1],
                        2
                    )+Math.pow(
                        value[2]-color[2],
                        2
                    )
                ),
                key,
                value
            ]
            total+=rankings[i][0]
        }
        rankings=rankings.sort(function(a,b){return -(a[0]-b[0])})
        return {
            output: rankings[0][1] + " " + Math.round(1000*rankings[0][0]/total)/10 + "% Certainty",
            color: rankings[0][2]
        }
    }

    static g(){
        JSBean.context.drawImage(JSBean.playerElement, -400, 0, 400, 400)
        JSBean.imgdat=JSBean.context.getImageData(175,175,50,50)
        JSBean.avgColor=[0,0,0]
        JSBean.rawimgdat= JSBean.imgdat["data"]
        for (let i = 0; i < JSBean.rawimgdat.length; i+=4) {
            JSBean.avgColor[0]+=JSBean.rawimgdat[i]
            JSBean.avgColor[1]+=JSBean.rawimgdat[i+1]
            JSBean.avgColor[2]+=JSBean.rawimgdat[i+2]
        }
        JSBean.avgColor[0]/=(JSBean.rawimgdat.length/4)
        JSBean.avgColor[1]/=(JSBean.rawimgdat.length/4)
        JSBean.avgColor[2]/=(JSBean.rawimgdat.length/4)

        let classification = JSBean.classify(JSBean.avgColor)
        JSBean.output.innerHTML= classification.output

        JSBean.context.strokeStyle = JSBean.gradient;
        JSBean.context.lineWidth = 6;
        JSBean.context.beginPath();
        JSBean.context.arc(-200,200,29,0,2*Math.PI);
        JSBean.context.stroke();

        JSBean.context.strokeStyle = 'rgb('+JSBean.avgColor+')';
        JSBean.context.lineWidth = 4;
        JSBean.context.beginPath();
        JSBean.context.arc(-200,200,29,0,Math.PI);
        JSBean.context.stroke();

        JSBean.context.strokeStyle = 'rgb('+classification.color+')';
        JSBean.context.lineWidth = 4;
        JSBean.context.beginPath();
        JSBean.context.arc(-200,200,29,Math.PI,2*Math.PI);
        JSBean.context.stroke();
    }
}

JSBean.main()