const ytdl = require('ytdl-core');
const search = require('tubesearch');

const songs = [];
const songList = document.getElementById('songList');

let currentlyPlaying;
let player;
let volume;

async function lookupTrack (event) {
  if (event.keyCode === 13) {
    const url = document.getElementById('urlBox').value;
    const isValidUrl = ytdl.validateURL(url) || ytdl.validateID(url);

    let link = url;

    if (!isValidUrl) {
      const searchResults = await search(url);
      if (searchResults.length > 0) {
        link = searchResults[0].id;
      }
    }

    getTrackInfo(link);
    document.getElementById('urlBox').value = '';
  }
}

async function getTrackInfo (url) {
  const info = await ytdl.getInfo(url);

  const streamURL = getBestStream(filterOpus(info.formats));
  if (!streamURL) {
    return alert(`Unplayable track: ${info.title}`);
  }

  const song = {
    title: info.title,
    url: streamURL.url,
    id: Date.now().toString() + info.video_id
  };

  songs.push(song);
  renderSongDiv(song);
}

function setVolume (val) {
  if (player) {
    player.volume = val / 100;
  }
}

function playSong (song) {
  if (player) {
    player.pause();
  }

  currentlyPlaying = song;
  player = new Audio(song.url);
  player.volume = volume || 1;
  player.onended = () => {
    const currentIndex = songs.indexOf(currentlyPlaying);
    if (!~currentIndex && songs.length > 0 || currentIndex === songs.length - 1) {
      return playSong(songs[0]);
    }

    return playSong(songs[currentIndex + 1]);
  };

  document.getElementById('tracktitle').innerHTML = song.title;
  player.play();

  const button = document.querySelector('button[onclick="PlayPause()"]');
  button.innerHTML = 'pause';

  const playing = document.querySelector('.playing');
  if (playing) {
    playing.className = playing.className.replace('playing', '');
  }

  document.querySelector(`.song[index="${songs.indexOf(currentlyPlaying)}"]`).className += ' playing';
}

function renderSongDiv (song) {
  const trackIndex = songs.indexOf(song);
  const parent = document.createElement('div');
  parent.setAttribute('index', trackIndex);
  parent.className = 'song';

  const songName = document.createElement('p');
  songName.innerText = song.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'material-icons';
  deleteBtn.innerText = 'clear'
  deleteBtn.onclick = () => {
    parent.parentElement.removeChild(parent);
    if (songs.includes(song)) {
      songs.splice(songs.indexOf(song), 1);
    }
  };
  parent.appendChild(songName);
  parent.appendChild(deleteBtn);
  songList.appendChild(parent);
}

function PlayPause () {
  const button = document.querySelector('button[onclick="PlayPause()"]');

  if (!currentlyPlaying) {
    button.innerHTML = 'pause';
    return playSong(songs[0]);
  }

  if (player.paused) {
    button.innerHTML = 'pause';
    player.play();
  } else {
    button.innerHTML = 'play_arrow';
    player.pause();
  }
}

function playNext () {
  if (songs.length === 0) {
    return;
  }

  const currentIndex = songs.indexOf(currentlyPlaying);
  if (!~currentIndex && songs.length > 0 || currentIndex === songs.length - 1) {
    return playSong(songs[0]);
  }

  return playSong(songs[currentIndex + 1]);
}

function playPrev () {
  if (songs.length === 0) {
    return;
  }

  const currentIndex = songs.indexOf(currentlyPlaying);
  if (!~currentIndex && songs.length > 0 || currentIndex === 0) {
    return playSong(songs[songs.length - 1]);
  }

  return playSong(songs[currentIndex - 1]);
}

function filterOpus (formats) {
  return formats.filter(f => ['251', '250', '249'].includes(f.itag));
}

function getBestStream (streams) {
  streams = Object.values(streams);
  streams.sort((a, b) => b.audioBitrate - a.audioBitrate);
  return streams[0];
}
