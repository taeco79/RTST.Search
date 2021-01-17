const path = require('path');
const fs = require('fs');

var dir = path.join(__dirname, 'public');

var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

module.exports = {
  // search: function (dbConn, req, page) {
  //   return new Promise((resolve, reject) = {

  //   });
  // }
  // ,
  loadFile: function (req, res) {
    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    if (file.indexOf(dir + path.sep) !== 0) {
      return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
    });
    s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('Not found');
    });
  }
  , logined: function (dbConn, req) {
    return new Promise((resolve, reject) => {
      var sql = '';

      if (typeof req.signedCookies.id === 'undefined') reject(Error('Session(id) none.'));
      else if (typeof req.signedCookies.key === 'undefined') reject(Error('Session(key) none.'));
      else {
        sql = '';
        sql += 'SELECT `TB-Session`.`Session` AS `No`';
        sql += ' FROM`TB-Session`';
        sql += ' INNER JOIN`TB-Member` ON`TB-Session`.`Member` = `TB-Member`.`Member`';
        sql += ' WHERE`TB-Session`.`Expired` > NOW()';
        sql += ' AND`TB-Member`.`id` = ?';
        sql += ' AND`TB-Session`.`key` = ?;';
        dbConn.query(sql, [req.signedCookies.id, req.signedCookies.key], (err, SESION) => {
          // console.log('RESULT', SESION);
          if (err) {
            console.log('logined', err);
            reject(Error('Session expired.'));
          } else if (SESION.length !== 1) {
            console.log('Session #2');
            reject(Error('Session none.'));
          } else {
            dbConn.query('UPDATE `TB-Session` SET `Expired` = DATE_ADD(NOW(), INTERVAL 20 MINUTE) WHERE `Session` = ?', [SESION[0].No], (err, result) => {
              // console.log('RESULT', result);
              if (err) {
                console.log('logined', err);
                reject(Error('Session expired.'));
              } else {
                resolve(true);
              }
            });
          }
        });
      }
    })
  }
  // logined: async function (dbConn, req, callback) {
  //   if (typeof req.signedCookies.id === 'undefined') return callback(false);
  //   else if (typeof req.signedCookies.key === 'undefined') return callback(false);
  //   else {
  //     console.log(req.signedCookies);

  //     var sql = '';
  //     sql += 'SELECT `TB-Session`.`Session` AS `No`';
  //     sql += ' FROM`TB-Session`';
  //     sql += ' INNER JOIN`TB-Member` ON`TB-Session`.`Member` = `TB-Member`.`Member`';
  //     sql += ' WHERE`TB-Session`.`Expired` > NOW()';
  //     sql += ' AND`TB-Member`.`id` <> ?';
  //     sql += ' AND`TB-Session`.`key` = ?;';
  //     await dbConn.query(sql, [req.signedCookies.id, req.signedCookies.key], (err, SESION) => {
  //       console.log('Session #1');
  //       if (err) {
  //         console.log('logined', err);
  //         return callback(false);
  //       } else if (SESION.length !== 1) {
  //         console.log('Session #2');
  //         return callback(false);
  //       } else {
  //         console.log('Session #3');
  //         return callback(true);
  //       }
  //     });
  //   }
  // }

  // 세션 테이블 생성
  , TB_Session: function (dbConn, res) {
    fs.readFile('./db/TB-Session.sql', 'utf8', function (err, data) {
      if (err) {
        res.json({ error: 9, message: '시스템 오류(DB::세션 테이블 생성 실패)가 발생했습니다.' });
      } else {
        dbConn.query(data, (err, rows) => {
          if (err)
            res.json({ error: 9, message: '일시적인 시스템 오류(DB::세션 테이블 생성 실패)가 발생했습니다.' });
          else {
            res.json({ error: 2, message: '일시적인 시스템 오류(DB::세션 정보 초기화)가 발생했습니다.' });
          }
        });
      }
    });
  }

  // 회원 테이블 생성
  , TB_Member: function (dbConn, res) {
    fs.readFile('./db/TB-Member.sql', 'utf8', function (err, data) {
      if (err) {
        res.json({ error: 9, message: '시스템 오류(DB::회원 테이블 생성 실패)가 발생했습니다.' });
      } else {
        dbConn.query(data, (err, rows) => {
          if (err)
            res.json({ error: 9, message: '일시적인 시스템 오류(DB::회원 테이블 생성 실패)가 발생했습니다.' });
          else {
            fs.readFile('./db/TB-Member.Insert.sql', 'utf8', function (err, data) {
              if (err) {
                console.log('Error', err);
                res.json({ error: 9, message: '시스템 오류(DB::회원 테이블 생성 실패)가 발생했습니다.' });
              } else {
                dbConn.query(data, ['taeco79@gmail.com', 'xorhkd77', '원태광'], (err, rows) => {
                  if (err)
                    res.json({ error: 9, message: '일시적인 시스템 오류(DB::회원 정보 초기화 실패)가 발생했습니다.' });
                  else
                    res.json({ error: 2, message: '일시적인 시스템 오류(DB::회원 정보 초기화)가 발생했습니다.' });
                });
              }
            });
          }
        });
      }
    });
  }



}