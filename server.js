const express = require("express");
const mysql = require('mysql');
const cfg = require('./config.js');
const db_conn = mysql.createConnection(cfg.db);
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const fn = require('./functions');
const fetch = require('node-fetch');
const urlencode = require("urlencode");
const { exit } = require("process");
const { rejects } = require("assert");

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

app.use(cookieParser('rtst-encript-string'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/login", (req, res) => {
  var sql = '';
  sql += 'SELECT `Member` AS `No`, `Key`, `Name`, `Grade`';
  sql += ' FROM`TB-Member`';
  sql += ' WHERE `id` = ?';
  sql += ' AND `Password` = SHA2(?, 256)';
  db_conn.query(sql, [req.body.id, req.body.password], (err, MEMBER) => {
    if (err) {
      if (err.message.match(/^ER\_NO\_SUCH\_TABLE: Table.+doesn't exist$/)) {
        fn.TB_Member(db_conn, res)
      } else {
        res.json({ error: 9, message: '시스템 오류(DB::Session::Unknown)가 발생했습니다.' });
      }
    } else if (MEMBER.length === 0)
      res.json({ error: 1, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    else {
      // 기존 로그인 세션 초기화.
      sql = '';
      sql += 'UPDATE `TB-Session`';
      sql += ' SET `Expired` = NOW()';
      sql += ' WHERE `Member` = ?';
      sql += ' AND `Expired` > NOW()';
      db_conn.query(sql, [MEMBER[0].No], (err, EXPIRED) => {
        if (err) {
          // console.log(err);
          if (err.message.match(/^ER\_NO\_SUCH\_TABLE: Table.+doesn't exist$/)) {
            fn.TB_Session(db_conn, res)
          } else {
            res.json({ error: 9, message: '시스템 오류(DB::Session::Unknown)가 발생했습니다.' })
          }
        } else {
          // console.log('MEMBER', MEMBER);
          sql = '';
          sql += 'INSERT INTO `TB-Session`';
          sql += ' SET `Expired` = DATE_ADD(NOW(), INTERVAL 20 MINUTE)';
          sql += ', `Member` = ?';
          sql += ', `Key` = UUID()';
          sql += ', `IP` = ?';
          db_conn.query(sql, [MEMBER[0].No, '0.0.0.0'], (err, SESSION) => {
            if (err) {
              // console.log(err);
              if (err.message.match(/^ER\_NO\_SUCH\_TABLE: Table.+doesn't exist$/)) {
                fn.TB_Session(db_conn, res)
              } else {
                res.json({ error: 9, message: '시스템 오류(DB::Session::Unknown)가 발생했습니다.' })
              }
            } else {
              db_conn.query('SELECT `Key` FROM `TB-Session` WHERE `Session` = ?', SESSION.insertId, (err, rows) => {
                if (err)
                  res.json({ error: 9, message: '시스템 오류(DB::Session::Unknown)가 발생했습니다.' })
                else {
                  // console.log('Session', rows);
                  res.cookie('id', req.body.id, { httpOnly: true, signed: true });
                  res.cookie('key', rows[0].Key, { httpOnly: true, signed: true });
                  res.cookie('name', MEMBER[0].Name);
                  res.cookie('grade', MEMBER[0].Grade);
                  res.json({ error: 0, message: '성공', data: rows });
                }
              });
            }
          });
        }
      });
    }
  });
  // // 
  // httpCode = 200;
  // if (false)
  //   res.cookie('key', 'value2', { httpOnly: true, signed: true })

  // // console.log(req);
  // if (true)
  //   res.json({ error: 0, message: 'sucess', params: req.body });
  // else
  //  res.json({ error: 1, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
});

app.all("/logout", (req, res) => {
  fn.clearSession(req, res);
  res.redirect('/');
});

app.get("/search", (req, res) => {
  // console.log(req.params.page);
  fn.logined(db_conn, req)
    .then((data) => {
      // console.log(process.env.API.toString() + '?input_str=' + req.query.q);
      fetch(process.env.API.toString() + '?input_str=' + urlencode(req.query.q))
        .then(data => { return data.json(); })
        .then(RESULT => {
          // console.log(RESULT);
          fs.readFile('./public/htm/search.htm', 'utf8', function (err, HTML) {
            // res.writeHead(200, { 'Content-Type': 'application/json' });
            // res.write(JSON.stringify({ error: 0, message: 'Sucess', data: RESULT }));

            HTML = HTML.toString().replace(/##RESULT##/gi, JSON.stringify(RESULT));

            HTML = HTML.toString().replace(/##search##/gi, req.query.q);
            if (RESULT.output.status !== 'Found')
              HTML = HTML.replace(/##Message##/gi, RESULT.input.type + '로 검색했으나, 결과가 존재하지 않습니다.');
            else
              if (RESULT.output.type === '특허등록번호')
                HTML = HTML.replace(/##Message##/gi, RESULT.input.type + '로 검색했으며, <b>' + RESULT.output.value.length + '개의 특허</b>를 찾았습니다.');
              else if (['기업코드', 'NICE업체코드'].includes(RESULT.output.type))
                HTML = HTML.replace(/##Message##/gi, RESULT.input.type + '로 검색했으며, <b>' + RESULT.output.value.length + '개의 기업</b>을 찾았습니다.');
              else
                HTML = HTML.replace(/##Message##/gi, RESULT.input.type + '로 검색했으며, <b>' + RESULT.output.value.length + '개의 ' + RESULT.output.type + '</b>을 찾았습니다.');
            res.end(HTML);
          });
        })
        .catch(err => {
          // console.log(RESULT);
          fs.readFile('./public/htm/search.htm', 'utf8', function (err, HTML) {
            HTML = HTML.toString().replace(/##RESULT##/gi, JSON.stringify({ "input": { "type": null, "value": req.query.q }, "output": { "status": "Not working", "type": null, "value": [] } }));

            HTML = HTML.toString().replace(/##search##/gi, req.query.q);
            HTML = HTML.replace(/##Message##/gi, '특허 검색 시스템이 동작하지 않습니다.');
            res.end(HTML);
          });
        });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.redirect('/');
    });
});

app.get("/summary/:type/:value", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      if (['특허등록번호', '특허출원번호'].includes(req.params.type)) {
        query = 'SELECT `inventionTitle`';
        query += ', `patent` AS `registerNumber`';
        query += ', DATE_FORMAT(`registed`, \'%Y-%m-%d\') AS `registerDate`';
        query += ', (SELECT `ipc` FROM `TB-PatentIPC` WHERE `patent` = `TB-Patent`.`patent` ORDER BY `index` LIMIT 1) AS `ipcNumber`';
        query += ', `astrtCont`';
        query += ' FROM `TB-Patent`';
        if (req.params.type === '특허등록번호') query += ' WHERE `patent` = ?';
        else query += ' WHERE `applicationNumber` = ?';
        param = [req.params.value];

      } else if (['사업자등록번호', '기업코드'].includes(req.params.type)) {
        query = 'SELECT *';
        query += ' FROM `TB-Company`';
        if (req.params.type === '사업자등록번호') query += ' WHERE `registerNumber` = ?';
        else query += ' WHERE `code` = ?';
        param = [req.params.value];
      }

      if (param.length) {
        db_conn.query(query, param, (err, RESULT) => {
          if (err) {
            console.log(err);
            res.json({ error: 9, message: err.message });
          } else {
            if (RESULT.length === 0)
              res.json({ error: 9, message: '데이터가 존재하지 않습니다.' });
            else {
              res.json({ error: 0, message: 'Sucess', data: RESULT[0] });
            }
          }
        });
      } else res.json({ error: 9, message: req.params.type });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.post("/summarys/:type", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = ''
      var param = [];
      switch (req.params.type) {
        case '기업코드':
          query = 'SELECT `TB-Company`.`key` AS `company`';
          query += ', IFNULL(`TB-Company`.`name`, \'\') AS `name`';
          query += ', IFNULL(`TB-Company`.`registerNumber`, \'\') AS `registerNumber`';
          // query += ', `TB-Company`.`representative`';
          // query += ', `TB-Company`.`address`';
          // query += ', `TB-Company`.`tel`';
          // query += ', `TB-Company`.`fax`';
          // query += ', `TB-Company`.`homepage`';
          // query += ', `TB-Company`.`email`';
          query += ', IFNULL(`TB-Company`.`businessTypes`, \'\') AS `businessTypes`';
          query += ', IFNULL(`TB-Company`.`businessItems`, \'\') AS `businessItems`';
          // query += ', `TB-Company`.`businessRegisted`';
          // query += ', `TB-Company`.`numberOfEmployees`';
          // query += ', `TB-Company`.`dateByEmployeeCount`';
          // query += ', `TB-Company`.`isKOSDAQ`';
          // query += ', `TB-Company`.`isINNOBIZ`';
          // query += ', `TB-Company`.`isHidenChampion`';
          // query += ', `TB-Company`.`isVenture`';
          // query += ', `TB-Company`.`nice`';
          // query += ', `TB-Company`.`ked`';
          // query += ', `TB-CompanyDemand`.`companyName`';
          // query += ', `TB-CompanyDemand`.`registerNumber`';
          // query += ', `TB-CompanyDemand`.`demandingTechnology`';
          query += ' , IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'N\') AS `introductoryIntention`';
          // query += ', `TB-CompanyDemand`.`technologyTransfer`';
          // query += ', `TB-CompanyDemand`.`technologyTransferDepartment`';
          // query += ', `TB-CompanyDemand`.`technologyTransferOfficer`';
          // query += ', `TB-CompanyDemand`.`technologyTransferTel`';
          query += ' FROM `TB-Company`';
          query += ' INNER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
          query += ' WHERE `TB-Company`.`keyCompany` IN (?)'; param.push(req.body.values);
          req.body.filter.forEach(filter => {
            if (filter === 'demandingTechnology') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`demandingTechnology`, \'\')) <> \'\'';
            if (filter === 'technologyTransferDepartment') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`technologyTransferDepartment`, \'N\')) = \'Y\'';
            if (filter === 'technologyTransfer') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`technologyTransfer`, \'N\')) = \'Y\'';
            if (filter === 'isKOSDAQ') query += ' AND TRIM(IFNULL(`TB-Company`.`isKOSDAQ`, \'N\')) = \'Y\'';
            if (filter === 'isINNOBIZ') query += ' AND TRIM(IFNULL(`TB-Company`.`isINNOBIZ`, \'N\')) = \'Y\'';
            if (filter === 'isHidenChampion') query += ' AND TRIM(IFNULL(`TB-Company`.`isHidenChampion`, \'N\')) = \'Y\'';
            if (filter === 'isVenture') query += ' AND TRIM(IFNULL(`TB-Company`.`isVenture`, \'N\')) = \'Y\'';

          });
          query += ' ORDER BY IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'N\') DESC';
          query += ' , CASE `TB-Company`.`keyCompany`';
          var idx = 0;
          req.body.values.forEach(item => {
            query += ' WHEN ? THEN ?'; param.push(item); param.push(idx++);
          });
          query += ' END ASC';
          query += ' LIMIT ?, 9;'; param.push((parseInt(req.body.page) - 1) * 9);
          // param = [req.body.values, (parseInt(req.body.page) - 1) * 10];
          break;
        case 'NICE업체코드':
          query = 'SELECT `TB-Company`.`nice` AS `company`';
          query += ', IFNULL(`TB-Company`.`name`, \'\') AS `name`';
          query += ', IFNULL(`TB-Company`.`registerNumber`, \'\') AS `registerNumber`';
          // query += ', `TB-Company`.`representative`';
          // query += ', `TB-Company`.`address`';
          // query += ', `TB-Company`.`tel`';
          // query += ', `TB-Company`.`fax`';
          // query += ', `TB-Company`.`homepage`';
          // query += ', `TB-Company`.`email`';
          query += ', IFNULL(`TB-Company`.`products`, \'\') AS `products`';
          // query += ', `TB-Company`.`businessRegisted`';
          // query += ', `TB-Company`.`numberOfEmployees`';
          // query += ', `TB-Company`.`dateByEmployeeCount`';
          // query += ', `TB-Company`.`isKOSDAQ`';
          // query += ', `TB-Company`.`isINNOBIZ`';
          // query += ', `TB-Company`.`isHidenChampion`';
          // query += ', `TB-Company`.`isVenture`';
          // query += ', `TB-Company`.`nice`';
          // query += ', `TB-Company`.`ked`';
          // query += ', `TB-CompanyDemand`.`companyName`';
          // query += ', `TB-CompanyDemand`.`registerNumber`';
          // query += ', `TB-CompanyDemand`.`demandingTechnology`';
          query += ' , IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'N\') AS `introductoryIntention`';
          // query += ', `TB-CompanyDemand`.`technologyTransfer`';
          // query += ', `TB-CompanyDemand`.`technologyTransferDepartment`';
          // query += ', `TB-CompanyDemand`.`technologyTransferOfficer`';
          // query += ', `TB-CompanyDemand`.`technologyTransferTel`';
          query += ' FROM `TB-Company`';
          query += ' INNER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
          query += ' WHERE `TB-Company`.`nice` IN (?)'; param.push(req.body.values);
          req.body.filter.forEach(filter => {
            if (filter === 'demandingTechnology') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`demandingTechnology`, \'\')) <> \'\'';
            if (filter === 'technologyTransferDepartment') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`technologyTransferDepartment`, \'N\')) = \'Y\'';
            if (filter === 'technologyTransfer') query += ' AND TRIM(IFNULL(`TB-CompanyDemand`.`technologyTransfer`, \'N\')) = \'Y\'';
            if (filter === 'isKOSDAQ') query += ' AND TRIM(IFNULL(`TB-Company`.`isKOSDAQ`, \'N\')) = \'Y\'';
            if (filter === 'isINNOBIZ') query += ' AND TRIM(IFNULL(`TB-Company`.`isINNOBIZ`, \'N\')) = \'Y\'';
            if (filter === 'isHidenChampion') query += ' AND TRIM(IFNULL(`TB-Company`.`isHidenChampion`, \'N\')) = \'Y\'';
            if (filter === 'isVenture') query += ' AND TRIM(IFNULL(`TB-Company`.`isVenture`, \'N\')) = \'Y\'';

          });
          query += ' ORDER BY IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'N\') DESC';
          query += ' , CASE `TB-Company`.`nice`';
          var idx = 0;
          req.body.values.forEach(item => {
            query += ' WHEN ? THEN ?'; param.push(item); param.push(idx++);
          });
          query += ' END ASC';
          query += ' LIMIT ?, 9;'; param.push((parseInt(req.body.page) - 1) * 9);
          // param = [req.body.values, (parseInt(req.body.page) - 1) * 10];
          break;
        case '특허등록번호':
          query = 'SELECT `TB-Patent`.`patent`';
          query += ', `TB-Patent`.`inventionTitle`';
          // query += ', `TB-Patent`.`applicationNumber`';
          // query += ', `TB-Patent`.`applicationDate`';
          query += ', `TB-Patent`.`patent` AS `registerNumber`';
          query += ', DATE_FORMAT( `TB-Patent`.`registed`, \'%Y-%m-%d\')`registerDate`';
          // query += ', `TB-Patent`.`expireDate`';
          // query += ', `TB-Patent`.`applicantName`';
          // query += ', `TB-Patent`.`applicantCompany`';
          // query += ', `TB-Patent`.`currentName`';
          // query += ', `TB-Patent`.`currentCompany`';
          // query += ', `TB-Patent`.`internationalApplicationNumber`';
          // query += ', `TB-Patent`.`internationalApplicationDate`';
          // query += ', `TB-Patent`.`internationalPublicationNumber`';
          // query += ', `TB-Patent`.`internationalPublicationDate`';
          query += ', (SELECT `ipc` FROM `TB-PatentIPC` WHERE `patent` = `TB-Patent`.`patent` ORDER BY `index` LIMIT 1) AS `ipcNumber`';
          query += ', `TB-Patent`.`astrtCont`';
          // query += ', `TB-Patent`.`representativeClaim`';
          // query += ', `TB-Patent`.`gradeAppraisal`';
          // query += ', `TB-Patent`.`gradeRight`';
          // query += ', `TB-Patent`.`gradeTech`';
          // query += ', `TB-Patent`.`gradeUse`';
          query += ' FROM `TB-Patent`';
          query += ' WHERE `TB-Patent`.`patent` IN (?)'; param.push(req.body.values);
          if (req.body.filter.length) {
            query += ' AND LEFT(TRIM(IFNULL(`TB-Patent`.`patent`, \'\')), 1) IN (?)'; param.push(req.body.filter);
          }
          query += ' ORDER BY CASE `patent`';
          var idx = 0;
          req.body.values.forEach(item => {
            query += ' WHEN ? THEN ?'; param.push(item); param.push(idx++);
          });
          query += ' END ASC';
          query += ' LIMIT ?, 8;'; param.push((parseInt(req.body.page) - 1) * 8);
          // param = [req.body.values, (parseInt(req.body.page) - 1) * 10];
          break;
        default:
          console.log('#########################');
          console.log(req.params.type);
          console.log('#########################');
      }
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          // console.log(err);
          res.json({ error: 9, message: err.message });
        } else {
          // if (req.params.type === '특허등록번호')
          //   RESULT.forEach(function (item) {
          //     console.log(item);
          //     item.ipcNumber = '';
          //   });
          res.json({ error: 0, message: 'Sucess', page: parseInt(req.body.page), data: RESULT });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/detail/:class/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fs.readFile('./public/htm/detail.' + (['company', 'nice'].includes(req.params.class) ? 'company' : 'patent') + '.htm', 'utf8', function (err, HTML) {
        var query = '';
        var param = [];
        switch (req.params.class) {
          case 'company':
            query = 'SELECT `TB-Company`.`name`';
            query += ', `TB-Company`.`registerNumber`';
            query += ', `TB-Company`.`representative`';
            query += ', IFNULL(`TB-Company`.`address`, \'-\') AS `address`';
            query += ', IFNULL(`TB-Company`.`tel`, \'-\') AS `tel`';
            query += ', IFNULL(`TB-Company`.`fax`, \'-\') AS `fax`';
            query += ', trim(IFNULL(`TB-Company`.`homepage`, \'\')) AS `homepage`';
            // query += ', \'http://www.naver.com\' AS `homepage`';
            query += ', IFNULL(`TB-Company`.`email`, \'-\') AS `email`';
            // query += ', IFNULL(`TB-Company`.`businessTypes`, \'-\') AS `businessTypes`';
            // query += ', IFNULL(`TB-Company`.`businessItems`, \'-\') AS `businessItems`';
            query += ', IFNULL(`TB-Company`.`products`, \'-\') AS `products`';
            query += ', IFNULL(DATE_FORMAT(`TB-Company`.`registed`, \'%Y-%m-%d\'), \'-\') AS `businessRegisted`';
            query += ', IFNULL(FORMAT(`TB-Company`.`numberOfEmployees`, 0), \'-\') AS `numberOfEmployees`';
            query += ', `TB-Company`.`numberOfEmployees`';
            query += ', IFNULL(DATE_FORMAT(`TB-Company`.`dateByEmployeeCount`, \'%Y-%m-%d\'), \'-\') AS `dateByEmployeeCount`';
            query += ', IFNULL(`TB-Company`.`isKOSDAQ`, \'N\') AS `isKOSDAQ`';
            query += ', IFNULL(`TB-Company`.`isINNOBIZ`, \'N\') AS `isINNOBIZ`';
            query += ', IFNULL(`TB-Company`.`isHidenChampion`, \'N\') AS `isHidenChampion`';
            query += ', IFNULL(`TB-Company`.`isVenture`, \'N\') AS `isVenture`';
            query += ', `TB-Company`.`nice`';
            // query += ', `TB-Company`.`ked`';
            query += ', IFNULL(`TB-CompanyDemand`.`demandingTechnology`, \'-\') AS `demandingTechnology`';
            query += ', IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'-\') AS `introductoryIntention`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransfer`, \'-\') AS `technologyTransfer`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferDepartment`, \'-\') AS `technologyTransferDepartment`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferOfficer`, \'-\') AS `technologyTransferOfficer`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferTel`, \'-\') AS `technologyTransferTel`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Assets`, 0) AS `q0Assets`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Debt`, 0) AS `q0Debt`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Sale`, 0) AS `q0Sale`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Profit`, 0) AS `q0Profit`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`NetProfit`, 0) AS `q0NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Assets`, 0) AS `q1Assets`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Debt`, 0) AS `q1Debt`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Sale`, 0) AS `q1Sale`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Profit`, 0) AS `q1Profit`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`NetProfit`, 0) AS `q1NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Assets`, 0) AS `q2Assets`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Debt`, 0) AS `q2Debt`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Sale`, 0) AS `q2Sale`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Profit`, 0) AS `q2Profit`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`NetProfit`, 0) AS `q2NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Assets`, 0) AS `q3Assets`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Debt`, 0) AS `q3Debt`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Sale`, 0) AS `q3Sale`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Profit`, 0) AS `q3Profit`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`NetProfit`, 0) AS `q3NetProfit`';
            query += ' FROM `TB-Company`';
            query += ' INNER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance0` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance0`.`keyCompany` AND `TB-CompanyFinance0`.`year` = YEAR(NOW()) - 0';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance1` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance1`.`keyCompany` AND `TB-CompanyFinance1`.`year` = YEAR(NOW()) - 1';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance2` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance2`.`keyCompany` AND `TB-CompanyFinance2`.`year` = YEAR(NOW()) - 2';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance3` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance3`.`keyCompany` AND `TB-CompanyFinance3`.`year` = YEAR(NOW()) - 3';
            query += ' WHERE `TB-Company`.`nice` = ?'; param.push(req.params.id);
            query += ' OR `TB-Company`.`code` = ?'; param.push(req.params.id);
            break;
          case 'nice':
            query = 'SELECT `TB-Company`.`name`';
            query += ', `TB-Company`.`registerNumber`';
            query += ', `TB-Company`.`representative`';
            query += ', IFNULL(`TB-Company`.`address`, \'-\') AS `address`';
            query += ', IFNULL(`TB-Company`.`tel`, \'-\') AS `tel`';
            query += ', IFNULL(`TB-Company`.`fax`, \'-\') AS `fax`';
            query += ', trim(IFNULL(`TB-Company`.`homepage`, \'\')) AS `homepage`';
            // query += ', \'http://www.naver.com\' AS `homepage`';
            query += ', IFNULL(`TB-Company`.`email`, \'-\') AS `email`';
            // query += ', IFNULL(`TB-Company`.`businessTypes`, \'-\') AS `businessTypes`';
            // query += ', IFNULL(`TB-Company`.`businessItems`, \'-\') AS `businessItems`';
            query += ', IFNULL(`TB-Company`.`products`, \'-\') AS `products`';
            query += ', IFNULL(DATE_FORMAT(`TB-Company`.`registed`, \'%Y-%m-%d\'), \'-\') AS `businessRegisted`';
            query += ', IFNULL(FORMAT(`TB-Company`.`numberOfEmployees`, 0), \'-\') AS `numberOfEmployees`';
            query += ', `TB-Company`.`numberOfEmployees`';
            query += ', IFNULL(DATE_FORMAT(`TB-Company`.`dateByEmployeeCount`, \'%Y-%m-%d\'), \'-\') AS `dateByEmployeeCount`';
            query += ', IFNULL(`TB-Company`.`isKOSDAQ`, \'N\') AS `isKOSDAQ`';
            query += ', IFNULL(`TB-Company`.`isINNOBIZ`, \'N\') AS `isINNOBIZ`';
            query += ', IFNULL(`TB-Company`.`isHidenChampion`, \'N\') AS `isHidenChampion`';
            query += ', IFNULL(`TB-Company`.`isVenture`, \'N\') AS `isVenture`';
            query += ', `TB-Company`.`nice`';
            // query += ', `TB-Company`.`ked`';
            query += ', IFNULL(`TB-CompanyDemand`.`demandingTechnology`, \'-\') AS `demandingTechnology`';
            query += ', IFNULL(`TB-CompanyDemand`.`introductoryIntention`, \'-\') AS `introductoryIntention`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransfer`, \'-\') AS `technologyTransfer`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferDepartment`, \'-\') AS `technologyTransferDepartment`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferOfficer`, \'-\') AS `technologyTransferOfficer`';
            query += ', IFNULL(`TB-CompanyDemand`.`technologyTransferTel`, \'-\') AS `technologyTransferTel`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Assets`, 0) AS `q0Assets`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Debt`, 0) AS `q0Debt`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Sale`, 0) AS `q0Sale`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`Profit`, 0) AS `q0Profit`';
            // query += ', FORMAT(`TB-CompanyFinance0`.`NetProfit`, 0) AS `q0NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Assets`, 0) AS `q1Assets`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Debt`, 0) AS `q1Debt`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Sale`, 0) AS `q1Sale`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`Profit`, 0) AS `q1Profit`';
            // query += ', FORMAT(`TB-CompanyFinance1`.`NetProfit`, 0) AS `q1NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Assets`, 0) AS `q2Assets`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Debt`, 0) AS `q2Debt`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Sale`, 0) AS `q2Sale`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`Profit`, 0) AS `q2Profit`';
            // query += ', FORMAT(`TB-CompanyFinance2`.`NetProfit`, 0) AS `q2NetProfit`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Assets`, 0) AS `q3Assets`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Debt`, 0) AS `q3Debt`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Sale`, 0) AS `q3Sale`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`Profit`, 0) AS `q3Profit`';
            // query += ', FORMAT(`TB-CompanyFinance3`.`NetProfit`, 0) AS `q3NetProfit`';
            query += ' FROM `TB-Company`';
            query += ' INNER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance0` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance0`.`keyCompany` AND `TB-CompanyFinance0`.`year` = YEAR(NOW()) - 0';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance1` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance1`.`keyCompany` AND `TB-CompanyFinance1`.`year` = YEAR(NOW()) - 1';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance2` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance2`.`keyCompany` AND `TB-CompanyFinance2`.`year` = YEAR(NOW()) - 2';
            // query += ' LEFT OUTER JOIN `TB-CompanyFinance` AS `TB-CompanyFinance3` ON `TB-Company`.`keyCompany` = `TB-CompanyFinance3`.`keyCompany` AND `TB-CompanyFinance3`.`year` = YEAR(NOW()) - 3';
            query += ' WHERE `TB-Company`.`nice` = ?'; param.push(req.params.id);
            break;
          case 'patent':
            query = 'SELECT `TB-Patent`.`patent`';
            query += ', `TB-Patent`.`inventionTitle`';
            query += ', `TB-Patent`.`applicationNumber`';
            query += ', IFNULL(DATE_FORMAT(`TB-Patent`.`applicationDate`, \'%Y-%m-%d\'), \'\') AS `applicationDate`';
            query += ', `TB-Patent`.`patent` AS `registerNumber`';
            query += ', IFNULL(DATE_FORMAT(`TB-Patent`.`registed`, \'%Y-%m-%d\'), \'\') AS `registerDate`';
            query += ', IFNULL(DATE_FORMAT(`TB-Patent`.`expireDate`, \'%Y-%m-%d\'), \'\') AS `expireDate`';
            // query += ', IFNULL(`TB-Patent`.`applicantName`, \'\') AS `applicantName`';
            // query += ', IFNULL(`TB-Patent`.`applicantCompany`, \'\') AS `applicantCompany`';
            // query += ', IFNULL(`TB-Patent`.`currentName`, \'\') AS `currentName`';
            // query += ', IFNULL(`TB-Patent`.`currentCompany`, \'\') AS `currentCompany`';
            query += ', `TB-Patent`.`internationalApplicationNumber`';
            query += ', IFNULL(DATE_FORMAT(`TB-Patent`.`internationalApplicationDate`, \'%Y-%m-%d\'), \'\') AS `internationalApplicationDate`';
            query += ', `TB-Patent`.`internationalPublicationNumber`';
            query += ', IFNULL(DATE_FORMAT(`TB-Patent`.`internationalPublicationDate`, \'%Y-%m-%d\'), \'\') AS `internationalPublicationDate`';
            // query += ', `TB-Patent`.`ipcNumber`';
            query += ', `TB-Patent`.`astrtCont`';
            query += ', `TB-Patent`.`representativeClaim`';
            query += ', IFNULL(`TB-Patent`.`gradeAppraisal`, \'-\') AS `gradeAppraisal`';
            query += ', IFNULL(`TB-Patent`.`gradeRight`, \'-\') AS `gradeRight`';
            query += ', IFNULL(`TB-Patent`.`gradeTech`, \'-\') AS `gradeTech`';
            query += ', IFNULL(`TB-Patent`.`gradeUse`, \'-\') AS `gradeUse`';
            query += 'FROM`TB-Patent`';
            query += 'WHERE`TB-Patent`.`patent` = ?;'; param.push(req.params.id);
            break;
          default:
            console.log('#########################');
            console.log(req.params.class);
            console.log('#########################');
        }
        db_conn.query(query, param, (err, RESULT) => {
          if (err) {
            console.log(err);
            res.json({ error: 9, message: err.message });
          } else {
            let reg = null;
            let tmpVAL = '';
            let tempKeys = [];
            let tempVals = [];
            for (const [field, value] of Object.entries(RESULT[0]))
              if (['applicantCompany', 'currentCompany'].includes(field)) continue;
              else {
                // console.log(field, value);
                tmpVAL = value
                if (field === 'homepage') {
                  tmpVAL = tmpVAL === '' ? '-' : '<a href="' + tmpVAL + '" target="_blank">' + tmpVAL + '</a>';
                  // } else if (field === 'applicantName') {
                  //   tempKeys = tmpVAL.split('||');
                  //   tempVals = RESULT[0].applicantCompany.split('||');
                  //   console.log('##############################');
                  //   console.log('SPLIT', tempKeys, tempVals);
                  //   console.log('##############################');
                  //   tmpVAL = '<ul>';
                  //   for (var i = 0; i < tempKeys.length; i++) {
                  //     tmpVAL += '<li>';
                  //     if (!['', '-'].includes(tempVals[i])) {
                  //       tmpVAL += '<a href="/detail/company/' + tempVals[i] + '">';
                  //       tmpVAL += tempKeys[i];
                  //       tmpVAL += '</a>';
                  //     } else
                  //       tmpVAL += tempKeys[i];
                  //     tmpVAL += '</li>';
                  //   }
                  //   tmpVAL = tmpVAL !== '<ul>' ? tmpVAL + '</ul>' : '';
                  // } else if (field === 'currentName') {
                  //   tempKeys = tmpVAL.split('||');
                  //   tempVals = RESULT[0].currentCompany.split('||');
                  //   console.log('##############################');
                  //   console.log('SPLIT', tempKeys, tempVals);
                  //   console.log('##############################');
                  //   tmpVAL = '<ul>';
                  //   for (var i = 0; i < tempKeys.length; i++) {
                  //     tmpVAL += '<li>';
                  //     if (!['', '-'].includes(tempVals[i])) {
                  //       tmpVAL += '<a href="/detail/company/' + tempVals[i] + '">';
                  //       tmpVAL += tempKeys[i];
                  //       tmpVAL += '</a>';
                  //     } else
                  //       tmpVAL += tempKeys[i];
                  //     tmpVAL += '</li>';
                  //   }
                  //   tmpVAL = tmpVAL !== '<ul>' ? tmpVAL + '</ul>' : '';
                  // } else if (field === 'ipcNumber') {
                  //   tempKeys = tmpVAL.split('||');
                  //   tmpVAL = '<ul>';
                  //   for (var i = 0; i < tempKeys.length; i++) {
                  //     tmpVAL += '<li>';
                  //     if (tempKeys[i] !== '-') {
                  //       tmpVAL += tempKeys[i];
                  //     } else
                  //       tmpVAL += tempKeys[i];
                  //     tmpVAL += '</li>';
                  //   }
                  //   tmpVAL = tmpVAL !== '<ul>' ? tmpVAL + '</ul>' : '';
                }
                reg = new RegExp('##' + field + '##', 'gi');
                HTML = HTML.replace(reg, tmpVAL === null ? '-' : tmpVAL);
              }

            if (req.params.class === 'patent') {
              Promise.all([
                fn.publishApplicants(db_conn, req.params.id)
                , fn.publishRights(db_conn, req.params.id)
                , fn.publishIPCs(db_conn, req.params.id)
              ])
                .then(htmls => {
                  console.log('HTMLS', htmls);
                  HTML = HTML.replace(/##applicantName##/g, htmls[0]);
                  HTML = HTML.replace(/##currentName##/g, htmls[1]);
                  HTML = HTML.replace(/##ipcNumber##/g, htmls[2]);

                  res.writeHead(200, {});
                  res.end(HTML);
                })
                .catch(err => {
                  console.log('ERROR', err);
                  res.writeHead(200, {});
                  res.end(HTML);
                });
            } else {
              res.writeHead(200, {});
              res.end(HTML);
            }
          }
        });
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.redirect('/');
    });
});

app.get("/news/:keyword/:limit/:page", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = null;
      var param = [];
      query = 'SELECT `name`';
      query += ' FROM `TB-Company`';
      query += ' WHERE `nice` = ?'; param.push(req.params.keyword);
      query += ' OR `code` = ?'; param.push(req.params.keyword);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          var url = 'https://openapi.naver.com/v1/search/news.json'
            + '?query=' + urlencode(RESULT[0].name)
            + '&display=' + req.params.limit
            + '&start=' + (((req.params.page - 1) * req.params.limit) + 1);
          // console.log(url);
          fetch(url, {
            method: 'GET'
            , headers: {
              'X-Naver-Client-Id': 'OT3kieLnav57fVOBXHZN'
              , 'X-Naver-Client-Secret': 'MZMHVMKiIJ'
            }
          })
            .then(data => { return data.json(); })
            .then(RESULT => {
              res.json({ error: 0, message: 'Sucess', data: RESULT });
            })
            .catch(err => {
              res.json({ error: 9, message: err.message, err: err });
            });
        }


      })
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/management/:class", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      if (data !== 9) throw 'denied';

      fs.readFile('./public/htm/' + req.params.class + '.htm', 'utf8', function (err, HTML) {
        res.writeHead(200, {});
        res.end(HTML);
      });
    })
    .catch((err) => {
      res.redirect('/');
    });
});

app.post("/member", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      if (data !== 9) throw 'denied';

      var query = ''
      var param = [];

      query = 'INSERT INTO `TB-Member`(`entry`, `key`, `ref`, `id`, `password`, `name`, `grade`)';
      query += ' SELECT NOW() AS`entry`';
      query += ', UUID() AS`key`';
      query += ', `TB-Member`.`member` AS`ref`';
      query += ', ? AS`id`'; param.push(req.body.id);
      query += ', SHA2(?, 256) AS`password`'; param.push(req.body.password);
      query += ', ? AS`name`'; param.push(req.body.name);
      query += ', ? AS`grade`'; param.push(req.body.grade);
      query += 'FROM`TB-Member`';
      query += 'INNER JOIN`TB-Session` ON`TB-Member`.`member` = `TB-Session`.`Member`';
      query += 'WHERE`TB-Member`.`id` = ?'; param.push(req.signedCookies.id);
      query += 'AND`TB-Session`.`Key` = ?'; param.push(req.signedCookies.key);
      query += 'LIMIT 1;';
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          if (/^ER_DUP_ENTRY:/i.test(err.message))
            res.json({ error: 9, message: '사용중인 아이디입니다.' });
          else
            res.json({ error: 9, message: err.message });
        } else {
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      if (err === 'redirect')
        res.json({ error: 9, message: 'Permission denied.' });
      else {
        fn.clearSession(req, res);
        res.json({ error: 8, message: 'Session out.' });
      }
    });
});

app.get("/members/:page", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fn.getMembers(db_conn, req, res, req.params.page, null);
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/members/:page/:keyword", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fn.getMembers(db_conn, req, res, req.params.page, req.params.keyword);
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.del("/members", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      if (data !== 9) throw 'denied';

      var query = '';
      var param = [];
      query = 'UPDATE `TB-Member`';
      query += ' SET `id` = SHA2(CONCAT(`id`, \'//\', DATE_FORMAT(`entry`, \'%Y%m%d%H%i%s\')), 256)';
      query += ', `isDeleted` = 1';
      query += ' WHERE `member` <> 1';
      query += ' AND `isDeleted` = 0';
      query += ' AND `id` <> ?'; param.push(req.signedCookies.id);
      query += ' AND `key` IN (?)'; param.push(req.body.ids);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          // console.log(err);
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      if (err === 'redirect')
        res.json({ error: 9, message: 'Permission denied.' });
      else {
        fn.clearSession(req, res);
        res.json({ error: 8, message: 'Session out.' });
      }
    });
});

app.del("/member/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      if (data !== 9) throw 'denied';

      var query = '';
      var param = [];
      query = 'UPDATE `TB-Member`';
      query += ' SET `id` = SHA2(CONCAT(`id`, \'//\', DATE_FORMAT(`entry`, \'%Y%m%d%H%i%s\')), 256)';
      query += ', `isDeleted` = 1';
      query += ' WHERE `member` <> 1';
      query += ' AND `isDeleted` = 0';
      query += ' AND `id` <> ?'; param.push(req.signedCookies.id);
      query += ' AND `key` = ?'; param.push(req.params.id);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      if (err === 'redirect')
        res.json({ error: 9, message: 'Permission denied.' });
      else {
        fn.clearSession(req, res);
        res.json({ error: 8, message: 'Session out.' });
      }
    });
});

app.put("/member/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      if (data !== 9) throw 'denied';

      var query = '';
      var param = [];
      query = 'UPDATE `TB-Member`';
      query += ' SET `name` = ?'; param.push(req.body.name);
      query += ', `grade` = ?'; param.push(req.body.grade);
      if (req.body.password.replace(/\s/gim, '') !== '') {
        query += ', `password` = SHA2(?, 256)'; param.push(req.body.password);
      }
      query += ' WHERE `isDeleted` = 0';
      query += ' AND `key` = ?'; param.push(req.params.id);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          // console.log(err);
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT, info: { key: req.params.id, name: req.body.name, grade: req.body.grade } });
        }
      });
    })
    .catch((err) => {
      if (err === 'redirect')
        res.json({ error: 9, message: 'Permission denied.' });
      else {
        fn.clearSession(req, res);
        res.json({ error: 8, message: 'Session out.' });
      }
    });
});

app.get("/companys/:page", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fn.getCompanys(db_conn, req, res, req.params.page, null);
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/companys/:page/:keyword", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fn.getCompanys(db_conn, req, res, req.params.page, req.params.keyword);
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/company/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      query = 'SELECT `key` AS `company`';
      query += ', `name`';
      query += ', `registerNumber`';
      query += ', `representative`';
      query += ', `address`';
      query += ', `tel`';
      query += ', `fax`';
      query += ', `homepage`';
      query += ', `email`';
      query += ', `businessTypes`';
      query += ', `businessItems`';
      query += ', DATE_FORMAT(`businessRegisted`, \'%Y-%m-%d\') AS`businessRegisted`';
      query += ', `numberOfEmployees`';
      query += ', DATE_FORMAT(`dateByEmployeeCount`, \'%Y-%m-%d\') AS`dateByEmployeeCount`';
      query += ', `isKOSDAQ`';
      query += ', `isINNOBIZ`';
      query += ', `isHidenChampion`';
      query += ', `isVenture`';
      query += ', `nice`';
      query += ', `ked`';
      query += ', `keyCompany`';
      query += ' FROM `TB-Company`';
      query += ' WHERE `TB-Company`.`isDeleted` = 0';
      query += ' AND `TB-Company`.`key` = ?'; param.push(req.params.id);
      // console.log(query);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/companyAll/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      query = 'SELECT `TB-Company`.`nice` AS `company`';
      query += ', `TB-Company`.`name`';
      query += ', `TB-Company`.`registerNumber`';
      query += ', `TB-Company`.`representative`';
      query += ', `TB-Company`.`address`';
      query += ', `TB-Company`.`tel`';
      query += ', `TB-Company`.`fax`';
      query += ', `TB-Company`.`homepage`';
      query += ', `TB-Company`.`email`';
      // query += ', `TB-Company`.`businessTypes`';
      // query += ', `TB-Company`.`businessItems`';
      query += ', `TB-Company`.`products`';
      query += ', DATE_FORMAT(`TB-Company`.`registed`, \'%Y-%m-%d\') AS`businessRegisted`';
      query += ', `TB-Company`.`numberOfEmployees`';
      query += ', DATE_FORMAT(`TB-Company`.`dateByEmployeeCount`, \'%Y-%m-%d\') AS`dateByEmployeeCount`';
      query += ', `TB-Company`.`isKOSDAQ`';
      query += ', `TB-Company`.`isINNOBIZ`';
      query += ', `TB-Company`.`isHidenChampion`';
      query += ', `TB-Company`.`isVenture`';
      query += ', `TB-Company`.`nice`';
      // query += ', `TB-Company`.`ked`';
      query += ', `TB-Company`.`code` AS `keyCompany`';
      query += ', `TB-CompanyDemand`.`demandingTechnology`';
      query += ', `TB-CompanyDemand`.`introductoryIntention`';
      query += ', `TB-CompanyDemand`.`technologyTransfer`';
      query += ', `TB-CompanyDemand`.`technologyTransferDepartment`';
      query += ', `TB-CompanyDemand`.`technologyTransferOfficer`';
      query += ', `TB-CompanyDemand`.`technologyTransferTel`';
      query += ' FROM `TB-Company`';
      query += ' LEFT OUTER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
      query += ' WHERE `TB-Company`.`isDeleted` = 0';
      query += ' AND `TB-Company`.`nice` = ?'; param.push(req.params.id);
      // console.log(query);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.put("/companyAll/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      query = ' UPDATE `TB-Company`';
      query += ' SET `TB-Company`.`isKOSDAQ` = ?'; param.push(req.body.isKOSDAQ);
      query += ', `TB-Company`.`isINNOBIZ` = ?'; param.push(req.body.isINNOBIZ);
      query += ', `TB-Company`.`isHidenChampion` = ?'; param.push(req.body.isHidenChampion);
      query += ', `TB-Company`.`isVenture` = ?'; param.push(req.body.isVenture);
      query += ' WHERE `TB-Company`.`isDeleted` = 0';
      query += ' AND `TB-Company`.`nice` = ?'; param.push(req.params.id);
      // console.log(query);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          var query = '';
          var param = [];
          query = 'INSERT INTO `TB-CompanyDemand` (`company`, `demandingTechnology`, `introductoryIntention`, `technologyTransfer`, `technologyTransferDepartment`, `technologyTransferOfficer`, `technologyTransferTel`)';
          query += ' SELECT `company`';
          query += ', ? AS`demandingTechnology`'; param.push(req.body.demandingTechnology);
          query += ', ? AS`introductoryIntention`'; param.push(req.body.introductoryIntention);
          query += ', ? AS`technologyTransfer`'; param.push(req.body.technologyTransfer);
          query += ', ? AS`technologyTransferDepartment`'; param.push(req.body.technologyTransferDepartment);
          query += ', ? AS`technologyTransferOfficer`'; param.push(req.body.technologyTransferOfficer);
          query += ', ? AS`technologyTransferTel`'; param.push(req.body.technologyTransferTel);
          query += ' FROM`TB-Company`';
          query += ' WHERE`isDeleted` = 0';
          query += ' AND `nice` = ?'; param.push(req.params.id);
          query += ' ON DUPLICATE KEY UPDATE `demandingTechnology` = ?'; param.push(req.body.demandingTechnology);
          query += ', `introductoryIntention` = ?'; param.push(req.body.introductoryIntention);
          query += ', `technologyTransfer` = ?'; param.push(req.body.technologyTransfer);
          query += ', `technologyTransferDepartment` = ?'; param.push(req.body.technologyTransferDepartment);
          query += ', `technologyTransferOfficer` = ?'; param.push(req.body.technologyTransferOfficer);
          query += ', `technologyTransferTel` = ?'; param.push(req.body.technologyTransferTel);
          // console.log(query);
          db_conn.query(query, param, (err, RESULT) => {
            if (err) {
              res.json({ error: 9, message: err.message });
            } else {
              // console.log(RESULT);
              res.json({ error: 0, message: 'Sucess', data: RESULT });
            }
          });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/demand/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      query = 'SELECT `TB-CompanyDemand`.`demandingTechnology`';
      query += ', `TB-CompanyDemand`.`introductoryIntention`';
      query += ', `TB-CompanyDemand`.`technologyTransfer`';
      query += ', `TB-CompanyDemand`.`technologyTransferDepartment`';
      query += ', `TB-CompanyDemand`.`technologyTransferOfficer`';
      query += ', `TB-CompanyDemand`.`technologyTransferTel`';
      query += ' FROM `TB-Company`';
      query += ' LEFT OUTER JOIN `TB-CompanyDemand` ON `TB-Company`.`company` = `TB-CompanyDemand`.`company`';
      query += ' WHERE `TB-Company`.`isDeleted` = 0';
      query += ' AND ';
      query += ' (`TB-Company`.`nice` = ?'; param.push(req.params.id);
      query += ' OR `TB-Company`.`code` = ?)'; param.push(req.params.id);
      // console.log(query);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/finance/:id", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      var query = '';
      var param = [];
      query = 'SELECT `TB-CompanyFinance`.`year`';
      query += ', NULL AS `quarter`';
      query += ', IFNULL(`TB-CompanyFinance`.`Assets`, 0) AS `Assets`';
      query += ', IFNULL(`TB-CompanyFinance`.`Debt`, 0) AS `Debt`';
      query += ', IFNULL(`TB-CompanyFinance`.`Sale`, 0) AS `Sale`';
      query += ', IFNULL(`TB-CompanyFinance`.`Profit`, 0) AS `Profit`';
      query += ', IFNULL(`TB-CompanyFinance`.`NetProfit`, 0) AS `NetProfit`';
      query += ' FROM `TB-Company`';
      query += ' INNER JOIN `TB-CompanyFinance` ON `TB-Company`.`company` = `TB-CompanyFinance`.`company`';
      query += ' WHERE `TB-Company`.`isDeleted` = 0';
      query += ' AND';
      query += ' (`TB-Company`.`nice` = ?'; param.push(req.params.id);
      query += ' OR `TB-Company`.`code` = ?)'; param.push(req.params.id);
      query += ' ORDER BY `TB-CompanyFinance`.`year` DESC';
      // query += ', `TB-CompanyFinance`.`quarter` DESC';
      // console.log(query);
      db_conn.query(query, param, (err, RESULT) => {
        if (err) {
          console.log(err);
          res.json({ error: 9, message: err.message });
        } else {
          // console.log(RESULT);
          res.json({ error: 0, message: 'Sucess', data: RESULT });
        }
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      res.json({ error: 8, message: 'Session out.' });
    });
});

app.get("/htm/*", (req, res) => fn.loadFile(req, res));
app.get("/img/*", (req, res) => fn.loadFile(req, res));
app.get("/css/*", (req, res) => fn.loadFile(req, res));
app.get("/js/*", (req, res) => fn.loadFile(req, res));

// simple route
app.get("*", (req, res) => {
  fn.logined(db_conn, req)
    .then((data) => {
      fs.readFile('./public/htm/index.htm', 'utf8', function (err, data) {
        res.writeHead(200, {});
        res.end(data);
      });
    })
    .catch((err) => {
      fn.clearSession(req, res);
      fs.readFile('./public/htm/login.htm', 'utf8', function (err, data) {
        res.writeHead(200, {});
        res.end(data);
      });
    });
});

if (typeof (process.env.API) !== 'undefined') {
  console.log('API Address >> ', process.env.API);
  // set port, listen for requests
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
} else {
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log('Does not have an API address.');
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  process.exit();
}