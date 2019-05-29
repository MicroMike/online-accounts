var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

const albums = {
  napster: [
    'https://app.napster.com/artist/honey/album/just-another-emotion',
    'https://app.napster.com/artist/yokem/album/boombeats',
    'https://app.napster.com/artist/mahone/album/stone-distraction',
    'https://app.napster.com/artist/hazel/album/electric-nature',
    'https://app.napster.com/artist/dj-reid/album/satisfaction-spell',
    'https://app.napster.com/artist/xondes/album/the-last-heat',
    'https://app.napster.com/artist/dj-otl/album/about-other-people',
    'https://app.napster.com/artist/dhn/album/blue-gun',
    // 'https://app.napster.com/artist/hanke/album/new-york-story',
    // 'https://app.napster.com/artist/hanke/album/100-revenge',
    // 'https://app.napster.com/artist/lapilluledors/album/red-beast',
  ],
  amazon: [
    'https://music.amazon.fr/albums/B07G9RM2MG',
    'https://music.amazon.fr/albums/B07CZDXC9B',
    'https://music.amazon.fr/albums/B07D3NQ235',
    'https://music.amazon.fr/albums/B07G5PPYSY',
    'https://music.amazon.fr/albums/B07D3PGSR4',
    'https://music.amazon.fr/albums/B07MTV7JYS',
    'https://music.amazon.fr/albums/B07PGN58LX',
    'https://music.amazon.fr/albums/B07QCBN3Z4',
    'https://music.amazon.fr/albums/B07RGRZL9F',
    'https://music.amazon.fr/albums/B07RNYTBXG',
  ],
  tidal: [
    'https://listen.tidal.com/album/93312939',
    'https://listen.tidal.com/album/93087422',
    'https://listen.tidal.com/album/88716570',
    'https://listen.tidal.com/album/101927847',
    'https://listen.tidal.com/album/102564740',
    'https://listen.tidal.com/album/102503463',
    'https://listen.tidal.com/album/105237098',
    'https://listen.tidal.com/album/108790098',
    'https://listen.tidal.com/album/108980716',
  ],
  spotify: [
    'https://open.spotify.com/album/3FJdPTLyJVPYMqQQUyb6lr',
    'https://open.spotify.com/album/5509gS9cZUrbTFege0fpTk',
    'https://open.spotify.com/album/2jmPHLM2be2g19841vHjWE',
    'https://open.spotify.com/album/5CPIRky6BGgl3CCdzMYAXZ',
    'https://open.spotify.com/album/0Tt1ldQ8b4zn5LRcM706ll',
    'https://open.spotify.com/album/2kFEMTIWWw0jXD57Ewr7go',
    'https://open.spotify.com/album/4BR7o0DwEPj1wF1nfcypiY',
    'https://open.spotify.com/album/6045wkKBhEx1DBoqn3aXSe',
    'https://open.spotify.com/album/7Jh67aHTA9ly7R1OTbzqGF',
  ]
}

const getAccounts = async (callback) => {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) return console.log(err);

    fs.readFile('napsterAccountDel.txt', 'utf8', async (err2, dataDel) => {
      if (err2) return console.log(err2);

      let Taccounts = data.split(',')

      dataDel = dataDel.split(',').filter(e => e)
      Taccounts = Taccounts.filter(e => dataDel.indexOf(e) < 0)

      Object.values(streams).forEach(s => Taccounts = Taccounts.filter(a => a !== s.account))
      Object.values(used).forEach(usedaccount => Taccounts = Taccounts.filter(a => a !== usedaccount))
      checkAccounts && checkAccounts.forEach(CA => Taccounts = Taccounts.filter(a => a !== CA))

      accounts = Taccounts
      callback(accounts)
    })
  });
}

const getCheckAccounts = async (callback) => {
  fs.readFile('check.txt', 'utf8', async (err, data) => {
    if (err) return console.log(err);
    checkAccounts = data.split(',').filter(e => e)
    callback(checkAccounts)
  })
}

function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);

  switch (req.url) {
    case 'albums':
      res.end(JSON.stringify(albums));
      break

    case 'accounts':
      getAccounts(a => res.end(JSON.stringify(a)))
      break

    case 'checkAccounts':
      getCheckAccounts(a => res.end(JSON.stringify(a)))
      break

    default:
      res.end(JSON.stringify({ index: true }));
      break
  }
}

io.on('connection', client => {
  client.emit('activate', client.id)
})

app.listen(process.env.PORT || 3000);