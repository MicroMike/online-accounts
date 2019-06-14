var app = require('http').createServer(handler)
var fs = require('fs');
const mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
    throw error;
  }
});

const SAccount = new mongoose.Schema({
  account: String,
  pending: Boolean,
  check: Boolean,
  pause: Boolean,
  del: Boolean,
});
const MAccount = mongoose.model('Account', SAccount, 'accounts');

const SGain = new mongoose.Schema({
  plays: Number,
  nexts: Number,
  time: Number,
});
const MGain = mongoose.model('Gain', SGain, 'gain');

const SSong = new mongoose.Schema({
  song: String,
  plays: Number,
});
const MSong = mongoose.model('Song', SSong, 'songs');

const albums = {
  napster: [
    'https://app.napster.com/artist/honey/album/just-another-emotion',
    'https://app.napster.com/artist/yokem/album/boombeats',
    'https://app.napster.com/artist/mahone/album/stone-distraction',
    'https://app.napster.com/artist/hazel/album/electric-nature',
    'https://app.napster.com/artist/dj-reid/album/satisfaction-spell',
    'https://app.napster.com/artist/xondes/album/the-last-heat',
    'https://app.napster.com/artist/dj-otl/album/about-other-people',
    // 'https://app.napster.com/artist/dhn/album/blue-gun',
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
    'https://open.spotify.com/album/2jmPHLM2be2g19841vHjWE',
    'https://open.spotify.com/album/5CPIRky6BGgl3CCdzMYAXZ',
    'https://open.spotify.com/album/0Tt1ldQ8b4zn5LRcM706ll',
    'https://open.spotify.com/album/2kFEMTIWWw0jXD57Ewr7go',
    'https://open.spotify.com/album/4BR7o0DwEPj1wF1nfcypiY',
    'https://open.spotify.com/album/6045wkKBhEx1DBoqn3aXSe',
    'https://open.spotify.com/album/7Jh67aHTA9ly7R1OTbzqGF',
    'https://open.spotify.com/episode/5CTWjaln8LbP3JMnDfL2SR',
    'https://open.spotify.com/episode/4LNlZZiOy32VQvTGXJ9BR9',
    'https://open.spotify.com/episode/0zDeN4F8lTTrieI3IvsCiI',
    'https://open.spotify.com/episode/07AeZf0ExTxB864NZIOGRP',
    'https://open.spotify.com/episode/77PytpYZNCs6d8uyzwYn1p',
    'https://open.spotify.com/episode/5get1YOTsPf6RAPIySupcV',
    'https://open.spotify.com/episode/5QrKbluyFZsg6jJ26ye7f6',
    'https://open.spotify.com/episode/4AFzaLO87GuTdtSuIk82r2',
    'https://open.spotify.com/episode/5YwlHKInZK9O6So8trYhBm',
    // 'https://open.spotify.com/album/5509gS9cZUrbTFege0fpTk',
  ]
}

const getAccounts = async (callback, reset) => {
  MAccount.find(reset ? {} : { check: false, del: false, pause: { $ne: true } }, function (err, Ra) {
    if (err) return console.error(err);
    const accounts = Ra.map(a => {
      if (reset) {
        a.check = false
        a.del = false
        a.save()
      }
      return a.account
    })
    callback(accounts)
  })
}

const getCheckAccounts = async (callback) => {
  MAccount.find({ check: true }, function (err, Ra) {
    if (err) return console.error(err);
    const accounts = Ra.map(a => a.account)
    callback(accounts)
  })
}

function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);

  const url = req.url.split('?')[0]
  const params = req.url.split('?')[1]

  switch (url) {
    case '/error': {
      const p = params && params.split('/')
      p[0] && p[1] && MAccount.findOne({ account: p[1] }, (err, Ra) => {
        if (err) return console.error(err);
        Ra[p[0]] = true
        Ra.save((err, a) => { res.end(JSON.stringify(a)) })
      })
      res.end(JSON.stringify({ index: true }));
      break
    }

    case '/addAccount': {
      const p = params && params.split('/')
      let accounts = {}
      p && p.forEach(a => {
        a && MAccount.findOne({ account: a }, (err, Ra) => {
          if (Ra) {
            accounts[a] = false
          }
          else {
            accounts[a] = true
            const r = new MAccount({ account: a, check: false, del: false });
            r.save((err, a) => { console.log(a) })
          }
        })
      })
      res.end(JSON.stringify({ accounts: accounts }));
      break
    }

    case '/reset':
      getAccounts(a => res.end(JSON.stringify(a)), true)
      break

    case '/albums':
      res.end(JSON.stringify(albums));
      break

    case '/accounts':
      getAccounts(a => res.end(JSON.stringify(a)))
      break

    case '/checkAccounts':
      getCheckAccounts(a => res.end(JSON.stringify(a)))
      break

    case '/checkOk':
      params && MAccount.findOne({ account: params }, (err, Ra) => {
        Ra.check = false
        Ra.save((err, a) => { res.end(JSON.stringify(a)) })
      })
      break

    case '/listen':
      params && MSong.findOne({ song: params }, (err, Ra) => {
        if (!Ra) {
          const r = new MSong({ song: params, plays: 1 })
          r.save((err, g) => { res.end(JSON.stringify(g)) })
        }
        else {
          Ra.plays = Ra.plays + 1
          Ra.save((err, a) => { res.end(JSON.stringify(a)) })
        }
      })
      break

    case '/gain':
      if (params) {
        const p = params.split('/')
        p[0] && p[1] && MGain.findOne((err, Rg) => {
          if (err) return console.error(err);

          if (!Rg) {
            const r = new MGain({ plays: 0, nexts: 0, time: 0 })
            r.save((err, g) => { res.end(JSON.stringify(g)) })
          }
          else {
            Rg.plays = Number(p[0])
            Rg.nexts = Number(p[1])
            Rg.time = Number(p[2])
            Rg.save((err, g) => { res.end(JSON.stringify(g)) })
          }
        })
      }
      else {
        MGain.findOne(function (err, Rg) {
          if (err) return console.error(err);

          if (!Rg) {
            const r = new MGain({ plays: 0, nexts: 0, time: 0 })
            r.save((err, g) => { res.end(JSON.stringify(g)) })
          }
          else {
            res.end(JSON.stringify(Rg))
          }
        })
      }
      break

    case '/spotifyPause': {
      MAccount.find({ "account": { "$regex": "^spotify", "$options": "i" } }, (err, Ra) => {
        Ra.forEach(r => {
          r.pause = true
          r.save()
        })
      })
    }

    default:
      res.end(JSON.stringify({ index: true }));
      break
  }
}

// io.on('connection', client => {
//   client.emit('activate', client.id)
// })

app.listen(process.env.PORT || 3000);