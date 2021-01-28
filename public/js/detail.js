var LIMITforNews = 10;
window.onload = function () {
  console.log('Detail Loaded.');
  getFinance();
  getDemand();
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMIT, 1);
}

function getFinance() {
  if (location.pathname.match(/^\/detail\/(company|nice)/) === null)
    return null;

  while (document.querySelectorAll('#finance > li').length)
    document.querySelector('#finance > li').remove();

  while (document.querySelector('#finance').classList.length)
    document.querySelector('#finance').classList.remove(document.querySelector('#finance').classList[0]);

  fetch('/finance/' + location.pathname.replace(/^.*\//, ''))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json.data.length === 0) throw '데이터가 존재하지 않습니다.';
      if (checkError(json)) {

        document.querySelector('#finance').appendChild(document.createElement('li'));
        ['기간', '자산총계', '부채총계', '매출액', '영업이익', '순이익'].forEach(function (item) {
          document.querySelector('#finance > li:last-child').appendChild(document.createElement('div'));
          document.querySelector('#finance > li:last-child > div:last-child').classList.add('title');
          document.querySelector('#finance > li:last-child > div:last-child').innerText = item;
        });

        var strLength = 0;
        json.data.forEach(function (record) {
          document.querySelector('#finance').appendChild(document.createElement('li'));
          for (var i = 0; i < record.length; i++) {
            console.log(record[i]);
          }
          for (const [field, value] of Object.entries(record)) {
            if (['quarter'].includes(field)) continue;
            else {
              document.querySelector('#finance > li:last-child').appendChild(document.createElement('div'));
              document.querySelector('#finance > li:last-child > div:last-child').appendChild(document.createElement('span'));
              if (field === 'year')
                document.querySelector('#finance > li:last-child > div:last-child > span').innerText = value + (record.quarter === null ? '' : ' / ' + record.quarter + 'Q');
              else {
                document.querySelector('#finance > li:last-child > div:last-child > span').classList.add('number');
                document.querySelector('#finance > li:last-child > div:last-child > span').innerText = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
            }
            if (strLength < document.querySelector('#finance > li:last-child > div:last-child > span').innerText.length)
              strLength = document.querySelector('#finance > li:last-child > div:last-child > span').innerText.length;
          }
        });
        for (var i = 0; i < document.querySelectorAll('#finance > li > div > span.number').length; i++)
          document.querySelectorAll('#finance > li > div > span.number')[i].setAttribute('style', 'width: ' + (strLength / 2.2) + 'rem;');
      } else {
        console.log('Here');
      }
    })
    .catch(function (err) {
      console.log(err);
      document.querySelector('#finance').classList.add('none');
    });
}

function getDemand() {
  if (location.pathname.match(/^\/detail\/(company|nice)/) === null)
    return null;

  while (document.querySelectorAll('#demand > li').length)
    document.querySelectorAll('#demand > li')[0].remove();

  while (document.querySelector('#demand').classList.length)
    document.querySelector('#demand').classList.remove(document.querySelector('#demand').classList[0]);

  fetch('/demand/' + location.pathname.replace(/^.*\//, ''))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json.data.length === 0) throw '데이터가 존재하지 않습니다.';

      if (checkError(json)) {
        document.querySelector('#demand').appendChild(document.createElement('li'));
        document.querySelector('#demand > li:last-child').appendChild(document.createElement('div'));
        document.querySelector('#demand > li:last-child > div:last-child').classList.add('title');
        document.querySelector('#demand > li:last-child > div:last-child').innerText = '수요기술';
        document.querySelector('#demand > li:last-child').appendChild(document.createElement('div'));
        document.querySelector('#demand > li:last-child > div:last-child').innerText = json.data[0].demandingTechnology === null ? '-' : json.data[0].demandingTechnology;

        document.querySelector('#demand').appendChild(document.createElement('li'));
        ['기술도입의향', '기술이전', '기술이전전담부서', '수요기술담당자', '수요기술담당자연락처'].forEach(function (item) {
          document.querySelector('#demand > li:last-child').appendChild(document.createElement('div'));
          document.querySelector('#demand > li:last-child > div:last-child').classList.add('title');
          document.querySelector('#demand > li:last-child > div:last-child').innerText = item;
        });
        document.querySelector('#demand').appendChild(document.createElement('li'));
        for (const [field, value] of Object.entries(json.data[0]))
          if (['demandingTechnology'].includes(field)) continue;
          else {
            document.querySelector('#demand > li:last-child').appendChild(document.createElement('div'));
            document.querySelector('#demand > li:last-child > div:last-child').innerText = value === null ? '-' : value;
          }
      } else {
        console.log('Here');
      }
    })
    .catch(function (err) {
      console.log(err);
      document.querySelector('#demand').classList.add('none');
    });
}

function getNews(keyword, limit, page) {
  if (location.pathname.match(/^\/detail\/(company|nice)/) === null)
    return null;

  while (document.querySelectorAll('#news > li').length)
    document.querySelectorAll('#news > li')[0].remove();

  fetch('/news/' + keyword + '/' + limit + '/' + page)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {
        json.data.items.forEach(function (item) {
          document.querySelector('#news').appendChild(document.createElement('li'));
          document.querySelector('#news > li:last-child').appendChild(document.createElement('a'));
          // document.querySelector('#news > li:last-child > a').appendChild(document.createTextNode(item.title));
          document.querySelector('#news > li:last-child > a').innerHTML = item.title;
          document.querySelector('#news > li:last-child > a').setAttribute('target', '_blank');
          document.querySelector('#news > li:last-child > a').setAttribute('href', item.link);
          document.querySelector('#news > li:last-child').appendChild(document.createElement('span'));
          document.querySelector('#news > li:last-child > span').appendChild(document.createTextNode((new Date(item.pubDate)).toISOString().replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d+Z/, '$1-$2-$3 $4:$5:$6')));
          document.querySelector('#news > li:last-child').appendChild(document.createElement('p'));
          // document.querySelector('#news > li:last-child > p').appendChild(document.createTextNode(item.description));
          document.querySelector('#news > li:last-child > p').classList.add('ellipsis-1');
          document.querySelector('#news > li:last-child > p').innerHTML = item.description;
        });
        showPaging(json.data.total, json.data.start < limit ? 1 : parseInt(json.data.start / limit) + 1);
      } else {
        console.log('Here');
      }
    })
    .catch(function (err) {
      console.log('News', 'catch', err);
    });
}

function changePage(page) {
  console.log(page);
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMITforNews, page);
}
