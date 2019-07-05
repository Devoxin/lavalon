const ytdl = require('ytdl-core');
const ts = require('tubesearch');

async function search (query) {
  const isUrlOrId = ytdl.validateURL(query) || ytdl.validateID(query);
  let videoId = query;

  if (!isUrlOrId) {
    const results = await ts(query);

    if (results.length === 0) {
      return null;
    }

    videoId = results[0].id;
  }

  return ytdl.getInfo(videoId)
    .then(info => (
      {
        title: info.title,
        url: info.video_url,
        playbackUrl: getStreamUrl(info),
        id: Date.now().toString() + info.video_id
      }
    ))
    .catch(_ => null);
}

function getStreamUrl (videoInfo) {
  // streams = Object.values(streams);
  // streams.sort((a, b) => b.audioBitrate - a.audioBitrate);
  // return streams[0];
  return videoInfo.formats
    //.filter(fmt => ['251', '250', '249'].includes(fmt.itag))
    .sort((a, b) => b.audioBitrate - a.audioBitrate)[0].url;
}

module.exports = {
  search
}
