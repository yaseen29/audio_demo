const volume = document.getElementById('volume')
const panControl = document.getElementById('panner')
const bass = document.getElementById('bass')
const mid = document.getElementById('mid')
const treble = document.getElementById('treble')
const visualizer = document.getElementById('visualizer')
const travis = document.getElementById('travis')
const MJ = document.getElementById('MJ')
const button1 = document.getElementById('button1')
const button2 = document.getElementById('button2')
const myDiv = document.getElementById('mydiv')
let listener;

const audioContext1 = new AudioContext();
const audioContext2 = new AudioContext();

// setting up the listener
listener = audioContext1.listener;
// const posX = window.innerWidth/innerWidth;
// const posY = window.innerHeight/innerHeight;
// const posZ = 300;

// positioning the listener
let rect = myDiv.getBoundingClientRect();
listener.positionX.value = rect.left;
listener.positionY.value = rect.top
dragElement(listener);
// listener.positionZ.value = posZ-5;

// listener audio orientation
// listener.forwardX.value = 0;
// listener.forwardY.value = 0;
// listener.forwardZ.value = -1;
// listener.upX.value = 0;
// listener.upY.value = 1;
// listener.upZ.value = 0;

// audio context orientation
let rectMJ = MJ.getBoundingClientRect();
const posX = rectMJ.left;
const posY = rectMJ.top;

const pannerModel = 'HRTF';
const innerCone = 60;
const outerCone = 30;
const outerGain = 0.3;

const distanceModel = 'linear';
const maxDistance = 10000;
const refDistance = 1;
const rollOff = 10;

const pannerTing = new PannerNode(audioContext1, {
  panningModel: pannerModel,
  distanceModel: distanceModel,
  refDistance: refDistance,
  maxDistance: maxDistance,
  rolloffFactor: rollOff,
  coneInnerAngle: innerCone,
  coneOuterAngle: outerCone,
  coneOuterGain: outerGain
})

const track1 = audioContext1.createMediaElementSource(MJ);
const track2 = audioContext2.createMediaElementSource(travis);
track1.connect(pannerTing).connect(audioContext1.destination);
track2.connect(audioContext2.destination);
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
      travis.play();
      this.dataset.playing = 'true';
  } else if (this.dataset.playing === 'true') {
      travis.pause();
      this.dataset.playing = 'false';
  }

}, false);
}

MJ.addEventListener('ended', () => {
  button1.dataset.playing = 'false';
}, false);

travis.addEventListener('ended', () => {
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