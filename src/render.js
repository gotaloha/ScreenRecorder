const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const { dialog, Menu } = remote;

// Global state

let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

// Buttons
const videoElement = document.querySelector('video');
const appEl = document.querySelector('.app');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

startBtn.onclick = e => {
  mediaRecorder.start();
  appEl.classList.add('active');
  startBtn.classList.add('active');
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  appEl.classList.remove('active');
  startBtn.classList.remove('active');
};

// Click event for choosing video source
videoSelectBtn.onclick = getVideoSources;

// TODO: Refactor this lunacy!

document.getElementById('min-btn').addEventListener('click', function (e) {
  var window = remote.getCurrentWindow();
  window.minimize(); 
});

document.getElementById('max-btn').addEventListener('click', function (e) {
  var window = remote.getCurrentWindow();
  if (!window.isMaximized()) {
    window.maximize();
  } else {
    window.unmaximize();
  }
});

document.getElementById('close-btn').addEventListener('click', function (e) {
  var window = remote.getCurrentWindow();
  window.close();
});

document.getElementById('close-btn').addEventListener('mouseover', function (e) {
  document.querySelector('.notifications span').classList.add('active');
  document.querySelector('.notifications span').innerHTML = 'Exit Application';
});

document.getElementById('close-btn').addEventListener('mouseout', function (e) {
  document.querySelector('.notifications span').classList.remove('active');
});

document.getElementById('max-btn').addEventListener('mouseover', function (e) {
  document.querySelector('.notifications span').classList.add('active');
  document.querySelector('.notifications span').innerHTML = 'Full Screen';
});

document.getElementById('max-btn').addEventListener('mouseout', function (e) {
  document.querySelector('.notifications span').classList.remove('active');
});

document.getElementById('min-btn').addEventListener('mouseover', function (e) {
  document.querySelector('.notifications span').classList.add('active');
  document.querySelector('.notifications span').innerHTML = 'Minimize Application';
});

document.getElementById('min-btn').addEventListener('mouseout', function (e) {
  document.querySelector('.notifications span').classList.remove('active');
});


// Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      };
    })
  );

  videoOptionsMenu.popup();
}

// Change the videoSource window to record
async function selectSource(source) {

  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // Create a Stream
  const stream = await navigator.mediaDevices
    .getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;

  // Update the UI
  ipcRenderer.send('resize-me-please');
  console.log('resize-me-please requested');
}

// Capture all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Save the video file on stop event
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
    // TODO: Return success message to the app
    writeFile(filePath, buffer, () => console.log('Video saved successfully!'));
  }
}
