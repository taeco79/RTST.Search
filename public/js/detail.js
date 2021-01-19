var LIMITforNews = 10;
window.onload = function () {
  console.log('Detail Loaded.');
  getFinance();
  getDemand();
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMIT, 1);
}

function getFinance() {
  while (document.querySelectorAll('#finance > li').length)
    document.querySelectorAll('#finance > li')[0].remove();

  fetch('/finance/' + location.pathname.replace(/^.*\//, ''))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {

        document.querySelector('#finance').append(document.createElement('li'));
        ['기간', '자산총계', '부채총계', '매출액', '영업이익', '순이익'].forEach(function (item) {
          document.querySelector('#finance > li:last-child').append(document.createElement('div'));
          document.querySelector('#finance > li:last-child > div:last-child').classList.add('title');
          document.querySelector('#finance > li:last-child > div:last-child').innerText = item;
        });

        var strLength = 0;
        json.data.forEach(record => {
          document.querySelector('#finance').append(document.createElement('li'));
          for (const [field, value] of Object.entries(record)) {
            if (['quarter'].includes(field)) continue;
            else {
              document.querySelector('#finance > li:last-child').append(document.createElement('div'));
              document.querySelector('#finance > li:last-child > div:last-child').append(document.createElement('span'));
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
        document.querySelectorAll('#finance > li > div > span.number').forEach(function (el) {
          el.setAttribute('style', 'width: ' + (strLength / 2.2) + 'rem;');
        });
      } else {
        console.log('Here');
      }
    })
    .catch(err => {
      console.log('News', 'catch', err);
    });
}

function getDemand() {
  while (document.querySelectorAll('#demand > li').length)
    document.querySelectorAll('#demand > li')[0].remove();

  fetch('/demand/' + location.pathname.replace(/^.*\//, ''))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {
        document.querySelector('#demand').append(document.createElement('li'));
        ['수요기술', '기술도입의향', '기술이전', '기술이전전담부서', '수요기술담당자', '수요기술담당자연락처'].forEach(function (item) {
          document.querySelector('#demand > li:last-child').append(document.createElement('div'));
          document.querySelector('#demand > li:last-child > div:last-child').classList.add('title');
          document.querySelector('#demand > li:last-child > div:last-child').innerText = item;
        });
        document.querySelector('#demand').append(document.createElement('li'));
        for (const [field, value] of Object.entries(json.data[0])) {
          document.querySelector('#demand > li:last-child').append(document.createElement('div'));
          document.querySelector('#demand > li:last-child > div:last-child').innerText = value === null ? '-' : value;
        }
      } else {
        console.log('Here');
      }
    })
    .catch(err => {
      console.log('News', 'catch', err);
    });
}

function getNews(keyword, limit, page) {
  while (document.querySelectorAll('#news > li').length)
    document.querySelectorAll('#news > li')[0].remove();

  fetch('/news/' + keyword + '/' + limit + '/' + page)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {
        json.data.items.forEach(item => {
          document.querySelector('#news').append(document.createElement('li'));
          document.querySelector('#news > li:last-child').append(document.createElement('a'));
          // document.querySelector('#news > li:last-child > a').append(document.createTextNode(item.title));
          document.querySelector('#news > li:last-child > a').innerHTML = item.title;
          document.querySelector('#news > li:last-child > a').setAttribute('target', '_blank');
          document.querySelector('#news > li:last-child > a').setAttribute('href', item.link);
          document.querySelector('#news > li:last-child').append(document.createElement('span'));
          document.querySelector('#news > li:last-child > span').append(document.createTextNode((new Date(item.pubDate)).toISOString().replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d+Z/, '$1-$2-$3 $4:$5:$6')));
          document.querySelector('#news > li:last-child').append(document.createElement('p'));
          // document.querySelector('#news > li:last-child > p').append(document.createTextNode(item.description));
          document.querySelector('#news > li:last-child > p').classList.add('ellipsis-1');
          document.querySelector('#news > li:last-child > p').innerHTML = item.description;
        });
        showPaging(json.data.total, json.data.start < limit ? 1 : parseInt(json.data.start / limit) + 1);
      } else {
        console.log('Here');
      }
    })
    .catch(err => {
      console.log('News', 'catch', err);
    });
}

function changePage(page) {
  console.log(page);
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMITforNews, page);
}
