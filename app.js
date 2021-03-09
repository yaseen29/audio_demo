const volume = document.getElementById('volume')
const panControl = document.getElementById('panner')
const bass = document.getElementById('bass')
const mid = document.getElementById('mid')
const treble = document.getElementById('treble')
const visualizer = document.getElementById('visualizer')
const RS = document.getElementById('RS')
const MJ = document.getElementById('MJ')
const button1 = document.getElementById('button1')
const button2 = document.getElementById('button2')
const myDiv = document.getElementById('mydiv')
const sounds1 = document.getElementById('sound1')
const sounds2 = document.getElementById('sound2')
var listener1;
var listener2;

const audioContext1 = new AudioContext();
const audioContext2 = new AudioContext();

// setting up the listener
listener1 = audioContext1.listener;
listener2 = audioContext2.listener ;
const recty = myDiv.getBoundingClientRect();
const posX = recty.left;
const posY = recty.top;
const posZ = 300;

//positioning the listeners

listener1.positionX.value = posX;
listener1.positionY.value = posY;
listener1.positionZ.value = posZ-5;

listener2.positionX.value = posX;
listener2.positionY.value = posY;
listener2.positionZ.value = posZ-5;

// listeners audio orientation
listener1.forwardX.value = 0;
listener1.forwardY.value = 0;
listener1.forwardZ.value = -1;
listener1.upX.value = 0;
listener1.upY.value = 1;
listener1.upZ.value = 0;

listener2.forwardX.value = 0;
listener2.forwardY.value = 0;
listener2.forwardZ.value = -1;
listener2.upX.value = 0;
listener2.upY.value = 1;
listener2.upZ.value = 0;


const pannerModel = 'HRTF';
const innerCone = 30;
const outerCone = 45;
const outerGain = 0.4;
const distanceModel = 'linear';
const maxDistance = 10000;
const refDistance = 1;
const rollOff = 10;

const pannerTing1 = new PannerNode(audioContext1, {
  panningModel: pannerModel,
  distanceModel: distanceModel,
  refDistance: refDistance,
  maxDistance: maxDistance,
  rolloffFactor: rollOff,
  coneInnerAngle: innerCone,
  coneOuterAngle: outerCone,
  coneOuterGain: outerGain
})


const pannerTing2 = new PannerNode(audioContext2, {
  panningModel: pannerModel,
  distanceModel: distanceModel,
  refDistance: refDistance,
  maxDistance: maxDistance,
  rolloffFactor: rollOff,
  coneInnerAngle: innerCone,
  coneOuterAngle: outerCone,
  coneOuterGain: outerGain
})


// panner nodes position and orientation
var rectMJ = sounds1.getBoundingClientRect();
pannerTing1.positionX = rectMJ.left;
pannerTing1.positionY.value = rectMJ.top;
pannerTing1.positionZ.value = 300;

if(pannerTing1.orientationX) {
  pannerTing1.orientationX.setValueAtTime(1, audioContext1.currentTime);
  pannerTing1.orientationY.setValueAtTime(0, audioContext1.currentTime);
  pannerTing1.orientationZ.setValueAtTime(0, audioContext1.currentTime);
} else {
  pannerTing1.setOrientation(1,0,0);
}

var rectRS = sounds2.getBoundingClientRect();
pannerTing2.positionX.value = rectRS.left;
pannerTing2.positionY.value = rectRS.top;
pannerTing2.positionZ.value = 300;



// var position1 = [pannerTing1.positionX, pannerTing1.positionY];
// var position2 = [pannerTing2.positionX, pannerTing2.positionY];


// const myMap = new Map([[pannerTing1, position1], [pannerTing2, position2]]);
// console.log(myMap)

const track1 = audioContext1.createMediaElementSource(MJ);
const track2 = audioContext2.createMediaElementSource(RS);
track1.connect(pannerTing1).connect(audioContext1.destination);
track2.connect(pannerTing2).connect(audioContext2.destination);
const context = audioContext1 //new AudioContext()
const analyserNode = new AnalyserNode(context, { fftSize: 256 })
const gainNode = new GainNode(context, { gain: volume.value})
const pannerOptions = { pan: 0 };
const panner = new StereoPannerNode(context, pannerOptions);
const bassEQ = new BiquadFilterNode(context, {
  type: 'lowshelf',
  frequency: 500,
  gain: bass.value
})
const midEQ = new BiquadFilterNode(context, {
  type: 'peaking',
  Q: Math.SQRT1_2,
  frequency: 1500,
  gain: mid.value
})
const trebleEQ = new BiquadFilterNode(context, {
  type: 'highshelf',
  frequency: 3000,
  gain: treble.value
})

// functions
setupEventListeners()
setupContext()
resize()
drawVisualizer()

// events
function setupEventListeners() {
  window.addEventListener('resize', resize)

  volume.addEventListener('input', e => {
    const value = parseFloat(e.target.value)
    let gainNode2 = context.createGain()
    // gainNode2.gain.setTargetAtTime(value, context.currentTime, .01)
    console.log(context)
    gainNode2.gain.value = value
  })

  panControl.addEventListener('input', function() {
    panner.pan.value = this.value;
}, false);  

  bass.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    bassEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  mid.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    midEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  treble.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    trebleEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  button1.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext1.state === 'suspended') {
        audioContext1.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        MJ.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        MJ.pause();
        this.dataset.playing = 'false';
    }

}, false);

button2.addEventListener('click', function() {

  // check if context is in suspended state (autoplay policy)
  if (audioContext2.state === 'suspended') {
      audioContext2.resume();
  }

  // play or pause track depending on state
  if (this.dataset.playing === 'false') {
      RS.play();
      this.dataset.playing = 'true';
  } else if (this.dataset.playing === 'true') {
      RS.pause();
      this.dataset.playing = 'false';
  }

}, false);
}

MJ.addEventListener('ended', () => {
  button1.dataset.playing = 'false';
}, false);

RS.addEventListener('ended', () => {
  button2.dataset.playing = 'false';
}, false);

async function setupContext() {
  const inputAudio = await getInputAudio()
  if (context.state === 'suspended') {
    await context.resume()
  }
  const source = context.createMediaStreamSource(inputAudio)
  source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(gainNode)
    .connect(panner)
    .connect(analyserNode)
    .connect(context.destination)
}

function getInputAudio() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  })
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer)

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)
  const width = visualizer.width
  const height = visualizer.height
  const barWidth = width / bufferLength

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)

  dataArray.forEach((item, index) => {
    const y = item / 255 * height / 2
    const x = barWidth * index

    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
    canvasContext.fillRect(x, height - y, barWidth, y)
  })
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

function updateListenerPosition(e) { 
  if (window.isDragging) {
    console.log("updateListenerPosition")
    console.log(`%c listener 1 X: %c ${listener1.positionX.value}`,
    "font-weight: bold",
    "color: green" )
    console.log(`%c listener 1 Y: %c ${listener1.positionY.value}`,
    "font-weight: bold",
    "color: blue" )
    console.log(`%c listener 2 X: %c ${listener2.positionX.value}`,
    "font-weight: bold",
    "color: green" )
    console.log(`%c listener 2 Y: %c ${listener2.positionY.value}`,
    "font-weight: bold",
    "color: blue" )
    
    let rect = myDiv.getBoundingClientRect();
    listener1.positionX.value = rect.left;
    listener1.positionY.value = rect.top;
    listener1.positionZ.value = 295;
    listener2.positionX.value = rect.left;
    listener2.positionY.value = rect.top;
    listener1.positionZ.value = 295;
  }

}

document.addEventListener("mousemove", updateListenerPosition);

// function getPositionAtCenter(element) {
//   const {top, left, width, height} = element.getBoundingClientRect();
//   return {
//     x: left + width / 2,
//     y: top + height / 2
//   };
// }

// function getDistanceBetweenElements(a, b) {
//  const aPosition = getPositionAtCenter(a);
//  const bPosition = getPositionAtCenter(b);

//  return Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y);  
// }

// const distance = getDistanceBetweenElements(
//  document.getElementById("x"),
//  document.getElementById("y")
// );