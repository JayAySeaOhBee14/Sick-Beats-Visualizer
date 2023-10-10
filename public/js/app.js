const visualizerContainer = document.getElementById('visualizerContainer');
const visualizerCanvas = document.getElementById('visualizerCanvas');
const audioFileInput = document.getElementById('audioFileInput');
const visualizerContext = visualizerCanvas.getContext('2d');
let audioStreamSource;
let audioDataAnalyzer;

const controls = [
	'play-large', // The large play button in the center
	//'restart', // Restart playback
	'play', // Play/pause playback
	'progress', // The progress bar and scrubber for playback and buffering
	'current-time', // The current time of playback
	'duration', // The full duration of the media
	'mute', // Toggle mute
	'volume', // Volume control
	'captions', // Toggle captions
	'settings', // Settings menu
	'pip', // Picture-in-picture (currently Safari only)
	'airplay', // Airplay (currently Safari only)
	'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
	'fullscreen' // Toggle fullscreen
];

const audioElement = document.getElementById('audioPlayer');
const player = new Plyr('#audioPlayer', {	controls });

player.on("ready", () => {
	updateAudioSource(audioElement, '/public/audio/song.mp3');

	document.addEventListener('click', () => {
		if (!audioStreamSource) {
			initializeAudioPlayer(audioElement);
		}
	});
});

visualizerCanvas.width = window.innerWidth;
visualizerCanvas.height = window.innerHeight + 400;

function initializeAudioPlayer(audioElement) {
	const audioProcessingContext = new AudioContext();
	audioStreamSource = audioProcessingContext.createMediaElementSource(audioElement);
	audioDataAnalyzer = audioProcessingContext.createAnalyser();
	audioStreamSource.connect(audioDataAnalyzer);
	audioDataAnalyzer.connect(audioProcessingContext.destination);
	audioDataAnalyzer.fftSize = 512;

	const frequencyDataLength = audioDataAnalyzer.frequencyBinCount;
	const frequencyDataArray = new Uint8Array(frequencyDataLength);

	animateFrequencyBars(frequencyDataLength, frequencyDataArray);
}

function updateAudioSource(audioElement, newSource) {
    // Update the audio element's source
    audioElement.src = newSource;
    audioElement.load();

    // Update the download button's href attribute
    const downloadButton = document.querySelector('.plyr__controls [data-plyr="download"]');
    if (downloadButton) {
        downloadButton.setAttribute('href', newSource);
    }
}

function animateFrequencyBars(frequencyDataLength, frequencyDataArray) {
	let barPositionX = 0;
	visualizerContext.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
	audioDataAnalyzer.getByteFrequencyData(frequencyDataArray);
	renderFrequencyBars(frequencyDataLength, barPositionX, frequencyDataArray);
	requestAnimationFrame(() => animateFrequencyBars(frequencyDataLength, frequencyDataArray));
}

audioFileInput.addEventListener('change', function() {
	const audioElement = document.getElementById('audioPlayer');
	updateAudioSource(audioElement, URL.createObjectURL(this.files[0]));
});

function renderFrequencyBars(frequencyDataLength, barPositionX, frequencyDataArray) {
	for (let i = 0; i < frequencyDataLength; i++) {
		const currentBarHeight = frequencyDataArray[i] * 1.2;
		const currentBarWidth = frequencyDataArray[i] * 0.4;
		visualizerContext.save();

		const xPos = Math.sin(i / 30 * Math.PI / 180) * 200;
		const yPos = Math.cos(i / 30 * Math.PI / 180) * 200;
		visualizerContext.translate(visualizerCanvas.width / 2 + xPos, visualizerCanvas.height / 2 - yPos / 5);
		visualizerContext.rotate(i + Math.PI * 2 / frequencyDataLength);

		const hueValue = i / 2 + 355;
		visualizerContext.fillStyle = `hsl(${hueValue}, 100000120%, 35%)`;
		visualizerContext.strokeStyle = `hsl(1, 100%, ${i / 2}%)`;

		visualizerContext.fillRect(xPos, yPos, currentBarWidth, currentBarHeight);
		visualizerContext.strokeRect(xPos, yPos, currentBarWidth, currentBarHeight);
		visualizerContext.restore();

		barPositionX += currentBarWidth;
	}
}
