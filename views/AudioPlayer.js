const YouTube = require('./YouTubeProvider');

class AudioPlayer extends Audio {

  constructor () {
    super();

    this.context = new AudioContext();
    this.source = this.context.createMediaElementSource(this);
    this.bassFilter = this.context.createBiquadFilter();
    this.bassFilter.type = "lowshelf"; 
    this.bassFilter.frequency.value = 250;
    this.bassFilter.gain.value = 0;

    this.source.connect(this.bassFilter);
    this.bassFilter.connect(this.context.destination);

    this.currentTrack = null;
    this.volume = 1;
  }

  get playing () {
    return this.currentTrack !== null;
  }

  resolveTrack (query) {
    return YouTube.search(query);
  }

  setBass (val) {
    this.bassFilter.gain.value = val;
  }

  start (track) {
    this.src = track.playbackUrl;
    this.play();

    this.currentTrack = track;

    this.dispatchEvent(new Event('mediachange')); // WHY THE FUCK DOESN'T THIS EXIST BY DEFAULT!?
  }

  on (event, cb) {
    this.addEventListener(event, cb);
  }

}

module.exports = AudioPlayer;
