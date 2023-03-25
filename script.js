const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;

container.addEventListener('click', function(){
    const audio1 = document.getElementById('audio1');
    audio1.src = 'Sharks.mp3'
    const audioContext = new AudioContext();
    audio1.play();
    if (audio1.isPlaying) {
      audio1.play();
    }
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight;
    let x;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
});

file.addEventListener('change', function(){
    const files = this.files;
    const audio1 = document.getElementById('audio1');
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();

    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight;
    let x;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
});

function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray){
     for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] * 1.2;
          barWidth = dataArray[i] * 0.4;
          ctx.save();
          let x = Math.sin(i/30 * Math.PI / 180) * 200;
          let y = Math.cos(i/30 * Math.PI / 180) * 200;
          ctx.translate(canvas.width/2 + x, canvas.height/2 - y/5)
          ctx.rotate( i +  Math.PI * 2/bufferLength);
          const hue = i / 2 + 355;
          ctx.fillStyle = 'hsl(' + hue + ', 100000120%, 35%)';
          ctx.strokeStyle = 'hsl(1, 100%, ' + i/2 + '%)';

          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.strokeRect(x, y, barWidth, barHeight);
          ctx.restore();
          x += barWidth;
       }
}