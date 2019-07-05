const AudioPlayer = require('./AudioPlayer');
const Keys = require('./KeyCodes');

const player = new AudioPlayer();

const tracks = [];
const trackList = document.getElementById('trackList');

async function lookupTrack (event) {
  if (event.keyCode === Keys.ENTER) {
    const query = document.getElementById('urlBox').value;
    document.getElementById('urlBox').value = '';

    const track = await player.resolveTrack(query);

    if (!track) {
      console.log('Bad query.');
      return;
    }

    tracks.push(track);
    renderSongDiv(track);

  }
}

function setVolume (val) {
  player.volume = val / 100;
}

function setBass (val) {
  player.setBass(val);
}

function seekTo (e) {
  const cursorX = e.pageX;
  // Todo: Figure out what 1 pixel is in seconds
  // multiply cursorX by X seconds
  // set player position.
  console.log(cursorX);
}

function playPause () {
  const button = document.querySelector('button[onclick="playPause()"]');

  if (!player.currentTrack) {
    if (tracks.length === 0) {
      return;
    }

    button.innerHTML = 'pause';
    player.start(tracks[0]);
  } else if (player.paused) {
    button.innerHTML = 'pause';
    player.play();
  } else {
    button.innerHTML = 'play_arrow';
    player.pause();
  }
}

function playNext () {
  if (!player.playing || tracks.length === 0) {
    return;
  }

  player.pause();

  const index = tracks.indexOf(player.currentTrack);

  if (index === -1 || index + 1 >= tracks.length) {
    player.start(tracks[0]);
  } else {
    player.start(tracks[index + 1]);
  }
}

player.on('play', () => {
  const interval = setInterval(() => {
    if (player.paused || player.ended) {
      return clearInterval(interval);
    }
    
    const pc = Math.min((player.currentTime / player.duration * 100), 100);
    document.getElementById('seekbar').style = `width: ${pc}%;`;
  }, 50);

  document.getElementById('tracktitle').innerHTML = player.currentTrack.title;
});

player.on('mediachange', () => {
  const lastSong = document.querySelector('.playing');

  if (lastSong) {
    lastSong.classList.remove('playing');
  }

  document.querySelector(`.song[id="${player.currentTrack.id}"]`).classList.add('playing');
});

player.on('ended', () => {
  document.getElementById('seekbar').style = 'width: 0%;';
  playNext();
});

function renderSongDiv (song) {
  const parent = document.createElement('div');
  parent.setAttribute('id', song.id);
  parent.className = 'song';

  const songName = document.createElement('p');
  songName.innerText = song.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'material-icons';
  deleteBtn.innerText = 'clear'
  deleteBtn.onclick = () => {
    parent.parentElement.removeChild(parent);
    if (tracks.includes(song)) {
      tracks.splice(tracks.indexOf(song), 1);
    }
  };
  parent.appendChild(songName);
  parent.appendChild(deleteBtn);
  trackList.appendChild(parent);
}

// function playPrev () {
//   if (songs.length === 0) {
//     return;
//   }

//   const currentIndex = songs.indexOf(currentlyPlaying);
//   if (!~currentIndex && songs.length > 0 || currentIndex === 0) {
//     return playSong(songs[songs.length - 1]);
//   }

//   return playSong(songs[currentIndex - 1]);
// }
