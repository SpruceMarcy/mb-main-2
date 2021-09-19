//Written by Marcy Brook

class easyAudio{
    constructor(func){
        this.func=func;
    }
    start(){
        if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
            mediaStreamPromise=navigator.mediaDevices.getUserMedia({audio: true})
            mediaStreamPromise.then(this.promiseFulfilled);
        }
        else {
            alert('getUserMedia() is not supported by your browser');
        }
    }
    promiseFulfilled(mediaStreamMain){
        
    }
}

//MAKES THE MAGICAL THING CALLED AN AudioContext. WHO KNOWS WHAT THIS DOES
const context = new AudioContext();

function process_microphone_buffer(event) {

    var i, N, inp, microphone_output_buffer;

    microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
}
function start_microphone(stream){

    gain_node = context.createGain();
    gain_node.connect( context.destination );

    microphone_stream = context.createMediaStreamSource(stream);
    microphone_stream.connect(gain_node); 

    script_processor_node = context.createScriptProcessor(16384, 1, 1);
    script_processor_node.onaudioprocess = process_microphone_buffer;

    microphone_stream.connect(script_processor_node);

    // --- enable volume control for output speakers


    // --- setup FFT

    script_processor_analysis_node = context.createScriptProcessor(2048, 1, 1);
    script_processor_analysis_node.connect(gain_node);

    analyser_node = context.createAnalyser();
    analyser_node.smoothingTimeConstant = 0;
    analyser_node.fftSize = 2048;

    microphone_stream.connect(analyser_node);

    analyser_node.connect(script_processor_analysis_node);

    var buffer_length = analyser_node.frequencyBinCount;

    var array_freq_domain = new Uint8Array(buffer_length);
    //var array_time_domain = new Uint8Array(buffer_length);

    console.log("buffer_length " + buffer_length);

    script_processor_analysis_node.onaudioprocess = function() {

        // get the average for the first channel
        analyser_node.getByteFrequencyData(array_freq_domain);
        //analyser_node.getByteTimeDomainData(array_time_domain);

        // draw the spectrogram
        if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {

            show_some_data(array_freq_domain, 3, "frequency");
        }
    };
}
function show_some_data(given_typed_array, num_row_to_display, label) {

    var size_buffer = given_typed_array.length;
            drawCanvas()

    for (var index = 0; index < num_row_to_display && index < size_buffer; index += 1) {
        
        var curr_value_time = (given_typed_array[index]*canvasHeight/128);

        gcontext.strokeStyle="#FFFFFF"
        gcontext.beginPath();
        gcontext.moveTo(0, curr_value_time);
        gcontext.lineTo(canvasWidth, curr_value_time);
        gcontext.stroke();
    }

}