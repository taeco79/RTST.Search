var LIMIT = 10;
window.onload = function () {
  console.log('Function loaded.');
  showMenu();
}

function showMenu() {
  try {
    if (getCookie('name') === null)
      throw '로그인 전입니다.';

    if (document.querySelectorAll('#menu').length)
      throw '메뉴가 이미 활성화 상태입니다.';

    document.querySelector('.searchMini').appendChild(document.createElement('div'));
    document.querySelector('.searchMini > div:last-child').setAttribute('id', 'menu')
    document.querySelector('.searchMini> div#menu').appendChild(document.createElement('a'));
    document.querySelector('.searchMini> div#menu > a').appendChild(document.createTextNode(decodeURI(getCookie('name'))));
    document.querySelector('.searchMini> div#menu').appendChild(document.createElement('ul'));
    if (!location.pathname.match(/^\/(|search)$/)) {
      document.querySelector('.searchMini> div#menu > ul').appendChild(document.createElement('li'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child').appendChild(document.createElement('a'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').setAttribute('href', '/');
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').appendChild(document.createTextNode('Home'));
    }
    if (!location.pathname.match(/^\/management\/members/)) {
      document.querySelector('.searchMini> div#menu > ul').appendChild(document.createElement('li'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child').appendChild(document.createElement('a'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').setAttribute('href', '/management/members');
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').appendChild(document.createTextNode('Members'));
    }
    if (!location.pathname.match(/^\/management\/companys/)) {
      document.querySelector('.searchMini> div#menu > ul').appendChild(document.createElement('li'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child').appendChild(document.createElement('a'));
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').setAttribute('href', '/management/companys');
      document.querySelector('.searchMini> div#menu > ul > li:last-child > a').appendChild(document.createTextNode('Companys'));
    }
    document.querySelector('.searchMini> div#menu > ul').appendChild(document.createElement('li'));
    document.querySelector('.searchMini> div#menu > ul > li:last-child').appendChild(document.createElement('a'));
    document.querySelector('.searchMini> div#menu > ul > li:last-child > a').setAttribute('href', '/logout');
    document.querySelector('.searchMini> div#menu > ul > li:last-child > a').appendChild(document.createTextNode('Logout'));
  } catch (err) {
    console.log(err.message);
  }
}
function getCookie(name) {
  var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value ? value[2] : null;
};

function optionalMessage(idx) {
  switch (idx) {
    case 9: return ' 관리자에게 문의하세요.';
    case 2: return ' 다시 시도하세요.';
    default: return '';
  }
}


function showPaging(total, page, limit) {
  if (typeof (limit) !== 'undefined')
    LIMIT = limit;
  while (document.querySelectorAll('#paging > *').length)
    document.querySelector('#paging > *').remove();

  var pages = parseInt(total / LIMIT) + (total % LIMIT === 0 ? 0 : 1);
  var start = (parseInt(page / 10) * 10) + 1
  var end = start + 9 > pages ? pages : start + 9;
  console.log(total, page, pages, LIMIT);

  if (document.querySelectorAll('#paging').length === 0) {
    document.querySelector('#frame').appendChild(document.createElement('ul'));
    document.querySelector('#frame > ul:last-child').setAttribute('id', 'paging');
  }

  document.querySelector('#paging').appendChild(document.createElement('li'));
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pFirst');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', 1);
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').classList.add('first');
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pFirst');

  document.querySelector('#paging').appendChild(document.createElement('li'));
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pPrev');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', start > 20 ? start - 10 : 1);
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').classList.add('prev');
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pPrev');

  for (var p = start; p <= end; p++) {
    document.querySelector('#paging').appendChild(document.createElement('li'));
    document.querySelector('#paging > li:last-child').appendChild(document.createElement('input'));
    document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
    document.querySelector('#paging > li:last-child > input').setAttribute('id', 'p' + p);
    document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
    document.querySelector('#paging > li:last-child > input').setAttribute('value', p);
    if (page === p)
      document.querySelector('#paging > li:last-child > input').setAttribute('checked', true);
    document.querySelector('#paging > li:last-child').appendChild(document.createElement('label'));
    document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'p' + p);
    document.querySelector('#paging > li:last-child > label:last-child').appendChild(document.createTextNode(p));
  }

  document.querySelector('#paging').appendChild(document.createElement('li'));
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pNext');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', pages > end + 1 ? start + 10 : pages);
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').classList.add('next');
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pNext');

  document.querySelector('#paging').appendChild(document.createElement('li'));
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pLast');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', pages);
  document.querySelector('#paging > li:last-child').appendChild(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').classList.add('last');
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pLast');

  for (var i = 0; i < document.querySelectorAll('#paging input').length; i++)
    document.querySelectorAll('#paging input')[i].addEventListener('change', function (e) {
      changePage(parseInt(document.querySelector('#paging input:checked').value));
    });
}

function checkError(result) {
  if (result.error === 8) {
    alert('세션이 종료되었습니다.\n\n다시 로그인해주세요.');
    location.href = '/';
  }
  return result.error === 0;
}