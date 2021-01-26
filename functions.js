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
  getMembers: function (dbConn, req, res, PAGE, KEYWORD) {
    var query = '';
    var param = [];
    query = 'SELECT COUNT(*) AS `Count`';
    query += ' FROM`TB-Member`';
    query += ' WHERE `TB-Member`.`member` <> 1';
    query += ' AND `TB-Member`.`isDeleted` = 0';
    if (KEYWORD !== null) {
      query += ' AND (`TB-Member`.`id` LIKE CONCAT(\'%\', ?, \'%\')'; param.push(KEYWORD);
      query += ' OR `TB-Member`.`name` LIKE CONCAT(\'%\', ?, \'%\'))'; param.push(KEYWORD);
    }
    dbConn.query(query, param, (err, COUNT) => {
      if (err) {
        res.json({ error: 9, message: err.message });
      } else {
        var query = '';
        var param = [];
        query = 'SELECT `TB-Member`.`key`';
        query += ', `TB-Member`.`id`';
        query += ', `TB-Member`.`name`';
        query += ', `TB-Member`.`grade`';
        query += ', DATE_FORMAT(`TB-Member`.`entry`, \'%Y-%m-%d %H:%i:%s\') AS `entry`';
        query += ', DATE_FORMAT(`TB-Member`.`update`, \'%Y-%m-%d %H:%i:%s\') AS `update`';
        query += ', DATE_FORMAT(MAX(`TB-Session`.`Logined`), \'%Y-%m-%d %H:%i:%s\') AS`logined`';
        query += ' FROM`TB-Member`';
        query += ' LEFT OUTER JOIN`TB-Session` ON`TB-Member`.`member` = `TB-Session`.`member`';
        query += ' WHERE `TB-Member`.`member` <> 1';
        query += ' AND `TB-Member`.`isDeleted` = 0';
        if (KEYWORD !== null) {
          query += ' AND (`TB-Member`.`id` LIKE CONCAT(\'%\', ?, \'%\')'; param.push(KEYWORD);
          query += ' OR `TB-Member`.`name` LIKE CONCAT(\'%\', ?, \'%\'))'; param.push(KEYWORD);
        }
        query += ' GROUP BY `TB-Member`.`key`';
        query += ', `TB-Member`.`id`';
        query += ', `TB-Member`.`name`';
        query += ', `TB-Member`.`entry`';
        query += ', `TB-Member`.`update`';
        query += ' LIMIT ?, 10;'; param.push((parseInt(PAGE) - 1) * 10);
        dbConn.query(query, param, (err, RESULT) => {
          if (err) {
            res.json({ error: 9, message: err.message });
          } else {
            // console.log(RESULT);
            res.json({ error: 0, message: 'Sucess', total: COUNT[0].Count, page: parseInt(PAGE), data: RESULT });
          }
        });
      }
    });

  }
  , getCompanys: function (dbConn, req, res, PAGE, KEYWORD) {
    var query = '';
    var param = [];
    query = 'SELECT COUNT(*) AS `Count`';
    query += ' FROM `TB-Company`';
    query += ' WHERE `TB-Company`.`isDeleted` = 0';
    if (KEYWORD !== null) {
      query += ' AND (`TB-Company`.`keyCompany` LIKE CONCAT(\'%\', ?, \'%\')'; param.push(KEYWORD);
      query += ' OR `TB-Company`.`registerNumber` LIKE CONCAT(\'%\', ?, \'%\'))'; param.push(KEYWORD);
    }
    // console.log(query);
    dbConn.query(query, param, (err, COUNT) => {
      if (err) {
        res.json({ error: 99, message: err.message });
      } else {
        var query = '';
        var param = [];
        query = 'SELECT `key` AS `company`';
        query += ', `keyCompany`';
        query += ', `registerNumber`';
        query += ', `name`';
        query += ', `representative`';
        // query += ', `address`';
        // query += ', `tel`';
        // query += ', `fax`';
        // query += ', `homepage`';
        // query += ', `email`';
        // query += ', `businessTypes`';
        // query += ', `businessItems`';
        // query += ', DATE_FORMAT(`businessRegisted`, \'%Y-%m-%d\') AS`businessRegisted`';
        // query += ', `numberOfEmployees`';
        // query += ', DATE_FORMAT(`dateByEmployeeCount`, \'%Y-%m-%d\') AS`dateByEmployeeCount`';
        // query += ', `isKOSDAQ`';
        // query += ', `isINNOBIZ`';
        // query += ', `isHidenChampion`';
        // query += ', `isVenture`';
        // query += ', `nice`';
        // query += ', `ked`';
        query += ' FROM `TB-Company`';
        query += ' WHERE `TB-Company`.`isDeleted` = 0';
        if (KEYWORD !== null) {
          query += ' AND (`TB-Company`.`keyCompany` LIKE CONCAT(\'%\', ?, \'%\')'; param.push(KEYWORD);
          query += ' OR `TB-Company`.`registerNumber` LIKE CONCAT(\'%\', ?, \'%\'))'; param.push(KEYWORD);
        }
        // console.log(query);
        query += ' LIMIT ?, 10;'; param.push((parseInt(PAGE) - 1) * 10);
        dbConn.query(query, param, (err, RESULT) => {
          if (err) {
            res.json({ error: 9, message: err.message });
          } else {
            // console.log(RESULT);
            res.json({ error: 0, message: 'Sucess', total: COUNT[0].Count, page: parseInt(PAGE), data: RESULT });
          }
        });
      }
    });

  }
  , loadFile: function (req, res) {
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
        sql += 'SELECT `TB-Session`.`Session` AS `No`, `TB-Member`.`grade` AS `Grade`';
        sql += ' FROM`TB-Session`';
        sql += ' INNER JOIN`TB-Member` ON`TB-Session`.`Member` = `TB-Member`.`Member`';
        sql += ' WHERE`TB-Session`.`Expired` > NOW()';
        sql += ' AND`TB-Member`.`id` = ?';
        sql += ' AND`TB-Session`.`key` = ?;';
        dbConn.query(sql, [req.signedCookies.id, req.signedCookies.key], (err, SESSION) => {
          // console.log('RESULT', SESSION);
          if (err) {
            console.log('logined', err);
            reject(Error('Session expired.'));
          } else if (SESSION.length !== 1) {
            console.log('Session #2');
            reject(Error('Session none.'));
          } else {
            dbConn.query('UPDATE `TB-Session` SET `Expired` = DATE_ADD(NOW(), INTERVAL 20 MINUTE) WHERE `Session` = ?', [SESSION[0].No], (err, result) => {
              // console.log('RESULT', result);
              if (err) {
                console.log('logined', err);
                reject(Error('Session expired.'));
              } else {
                resolve(SESSION[0].Grade);
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
  //     await dbConn.query(sql, [req.signedCookies.id, req.signedCookies.key], (err, SESSION) => {
  //       console.log('Session #1');
  //       if (err) {
  //         console.log('logined', err);
  //         return callback(false);
  //       } else if (SESSION.length !== 1) {
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