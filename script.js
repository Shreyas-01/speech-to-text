const noBrowserSupport=document.getElementById("no-browser-support");
const app=document.querySelector(".app");

try {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    noBrowserSupport.style.display = "none";
} catch(e) {
    console.error(e);
    noBrowserSupport.style.visibility = "visible";
    app.style.visibility = "none";
}

// const grammar = '#JSGF V1.0';
// const speechRecognitionList = new SpeechGrammarList();
// speechRecognitionList.addFromString(grammar, 1);
// recognition.grammars = speechRecognitionList;
const texts=document.getElementById("textarea");
const instruction=document.getElementById("instructions");
const startBtn=document.getElementById("start-record-btn");
const pauseBtn=document.getElementById("pause-record-btn");
const saveBtn=document.getElementById("save-note-btn");
const SpeechList=document.getElementById("notes");
const body=document.querySelector("body");
var content='';

var Speeches=getSpeeches();
renderSpeeches(Speeches);

recognition.lang = 'en-US';
recognition.continuous=true;
// recognition.interimResults = true;

//**********************API EVENTS*************************

recognition.onstart = () => {
    console.log('Microphone is activated');
    instruction.innerText="Voice recognition is activated";
};

recognition.onspeechend = function() {
    if(content.length>0 && content.charAt(content.length-1)!='.' &&  content.charAt(content.length-1)!=' '){
        content+=". ";
        texts.innerText=content;
    }
    console.log("onspeechend activated");
    // recognition.start();
}

recognition.onnomatch =() => {
    instruction.innerText="Speech not recognized";
    console.log("onnomatch activated");
}

recognition.onresult= (event) => {
    console.log("onresult activated");
    if(content.length>0 && content.charAt(content.length-1)!='.' &&  content.charAt(content.length-1)!=' '){
        content+=". ";
        texts.innerText=content;
    }
    const cur = event.resultIndex;
    const transcript = event.results[cur][0].transcript;
    content+=transcript;
    texts.innerText=content;
}

recognition.onerror= () => {
    console.log("onerror activated");
    instruction.innerText="Error. Try Again";
}

// **************************EVENTS**********************

startBtn.addEventListener("click",() => {
    // instruction.innerText="Speech recognition is activated";
    recognition.start();
});

pauseBtn.addEventListener("click",() => {
    if(content.length>0 && content.charAt(content.length-1)!='.' &&  content.charAt(content.length-1)!=' '){
        content+=". ";
        texts.innerText=content;
    }
    instruction.innerText="Speech recognition paused";
    recognition.stop();
});

saveBtn.addEventListener("click",() => {
    recognition.stop();
    if(content=="" || content==" ") {
        instruction.innerText="No voice heard"
    } else {
        if(content.length>0 && content.charAt(content.length-1)!='.' &&  content.charAt(content.length-1)!=' '){
            content+=". ";
        }
        saveSpeech(new Date().toLocaleString(),content);
        content='';
        renderSpeeches(getSpeeches());
        texts.innerText='';
        instruction.innerText="Speech Saved";
    }
});

SpeechList.addEventListener("click", (event) => {
    event.preventDefault();
    var target = event.target;
    console.log(target);

    if(target.classList.contains('listen-speech')){
    var content = target.parentNode.nextElementSibling.innerHTML;
    synthesis(content);
    }

    if(target.classList.contains('delete-speech')){
    var dateTime = target.previousElementSibling.innerHTML;
    deleteSpeech(dateTime);
    target.closest('.note').remove();
    }
});

// *********************FUNCTIONS***********************

function saveSpeech(dateTime, content){
    localStorage.setItem("note-" + dateTime, content);
};

function getSpeeches(){
    let Speeches=[];
    let key;
    for(var i=0;i<localStorage.length;i++){
        key=localStorage.key(i);
        if(key.substring(0,5) == "note-"){
            Speeches.push({
            date: key.replace('note-',''),
            content: localStorage.getItem(localStorage.key(i))
            });
        } 
    }
    return Speeches;
};

function deleteSpeech(dateTime){
    localStorage.removeItem("note-"+dateTime);
};

function renderSpeeches(Speeches){
    var html='';
    if(Speeches.length!=0){
        Speeches.forEach((Speech)=> {
            html+= `<li class="note">
            <p class="record">
                <span class="date">${Speech.date}</span>
                <a href="#" class="delete-speech">Delete</a>
                <a href="#" class="listen-speech">Listen Speech</a>
            </p>
            <p class="content">${Speech.content}</p>
            </li>`;   
        });
    } else {
        html = '<li><p class="content text-center">No speeches transcribed yet.</p></li>';
    }
    SpeechList.innerHTML=html;
};

// ********************Synthesis*********************

function synthesis(contents){
    var synth=new SpeechSynthesisUtterance();
    if(synth.speaking){
        console.error('already speaking');
        return;
    }

    synth.text=contents;
    synth.rate = 1;
    synth.pitch = 1;
    window.speechSynthesis.speak(synth);
}