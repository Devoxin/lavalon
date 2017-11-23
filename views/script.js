const ytdl = require('ytdl-core');
const { join } = require('path');
const fs = require('fs');
const ytrx = new RegExp('(?:youtube\\.com.*(?:\\?|&)(?:v|list)=|youtube\\.com.*embed\\/|youtube\\.com.*v\\/|youtu\\.be\\/)((?!videoseries)[a-zA-Z0-9_-]*)');


const songs = [];
const songList = document.getElementById('songList');

let currentlyPlaying;
let volume;

function readURL () {
  setTimeout(() => {
    const url = document.getElementById('urlBox').value;
    if (ytrx.test(url)) {
      downloadFile(url);
    }
  }, 100);
}

async function downloadFile (url) {
  const info = await ytdl.getInfo(url);

  const song = {
    title: info.title,
    url: getBestStream(filterOpus(info.formats)).url,
    index: songs.length
  }

  songs.push(song);
  renderSongDiv(song);
}

function playSong (song) {
  if (currentlyPlaying) {
    currentlyPlaying.pause();
  }
  currentlyPlaying = new Audio(song.url);
  currentlyPlaying.volume = volume || 1;
  currentlyPlaying.onended = () => {
    const nextTrack = (song.index >= songs.length - 1 ? 0 : songs[song.index + 1]);
    playSong(nextTrack);
  };
  currentlyPlaying.play();

  let parent = document.querySelector(`.song[index="${song.index}"]`);
  if (parent.className.includes('fadein')) {
    parent.className = parent.className.replace('fadein ', '');
  }
  const playing = document.querySelector('.playing');
  if (playing) {
    playing.className = playing.className.replace('playing', 'playing-end');
    setTimeout(() => {
      playing.className = playing.className.replace('playing-end', '');
    }, 750);
  }
  document.querySelector(`.song[index="${song.index}"]`).className += ' playing';
}

function renderSongDiv (song) {
  const parent = document.createElement('div');
  parent.setAttribute('index', song.index);
  parent.className = 'song fadein container level';
  const children = [];

  const songName = document.createElement('div');
  songName.innerHTML = song.title;
  songName.className = 'songName level-left';
  children.push(songName);

  const btns = document.createElement('div');
  btns.className = 'level-right';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button is-danger is-small';
  deleteBtn.innerHTML = 'Delete';
  deleteBtn.onclick = () => {
    parent.parentElement.removeChild(parent);
    if (songs.includes(song)) {
      songs.splice(songs.indexOf(song), 1)
    }
  }
  btns.appendChild(deleteBtn);

  const playBtn = document.createElement('button');
  playBtn.className = 'button is-primary is-small';
  playBtn.innerHTML = 'Play';
  playBtn.onclick = () => {
    console.log('Now playing: ' + song.title);
    playSong(song);
  }
  btns.appendChild(playBtn);

  children.push(btns);

  for (const child of children) {
    parent.appendChild(child);
  }

  songList.appendChild(parent);
}

function PlayPause () {
  const button = document.querySelector('button[onclick="PlayPause()"]');

  if (!currentlyPlaying) {
    button.innerHTML = 'Pause';
    return playSong(songs[0]);
  }

  const playingSong = document.querySelector(`div[index="${songs.indexOf(currentlyPlaying.src.slice(7).replace(/%20/g, ' '))}"]`);

  if (currentlyPlaying.paused) {
    button.innerHTML = 'Pause';
    playingSong.className = playingSong.className.replace('paused', 'playing')
    currentlyPlaying.play();
  } else {
    playingSong.className = playingSong.className.replace('playing', 'playing-end');
    setTimeout(() => {
      playingSong.className = playingSong.className.replace('playing-end', 'paused');
    }, 750);
    button.innerHTML = 'Play';
    currentlyPlaying.pause();
  }
}

function playNext () {
  const currentIndex = songs.indexOf(currentlyPlaying.src.slice(7).replace(/%20/g, ' '));
  playSong(currentIndex >= songs.length - 1 ? 0 : currentIndex + 1);
}

function playPrev () {
  const currentIndex = songs.indexOf(currentlyPlaying.src.slice(7).replace(/%20/g, ' '));
  playSong(currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1);
}

function filterOpus(formats) {
    return formats.filter(f => f.type && f.type.includes('audio/webm') && f.url && f.audioBitrate);
}

function getBestStream(streams) {
    let highest;
    streams.forEach(s => {
        if (!highest) {
            highest = s;
        } else {
            if (s.audioBitrate > highest.audioBitrate)
                highest = s;
        }
    });

    return highest;
}