var LIMIT = 10;
window.onload = function () {
  console.log('Detail Loaded.');
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMIT, 1);
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
          document.querySelector('#news > li:last-child > span').append(document.createTextNode(item.pubDate));
          document.querySelector('#news > li:last-child').append(document.createElement('p'));
          // document.querySelector('#news > li:last-child > p').append(document.createTextNode(item.description));
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
  getNews(location.pathname.replace(/^.*[\/]/, ''), LIMIT, page);
}
