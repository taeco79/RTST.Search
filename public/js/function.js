window.onload = function () {
  console.log('Function loaded.');
  showMenu();
}

function showMenu() {
  try {
    if (getCookie('name') === null)
      throw '로그인 전입니다.';

    document.querySelector('body').append(document.createElement('ul'));
    document.querySelector('body > ul:last-child').setAttribute('id', 'menu')
    document.querySelector('body > ul#menu').append(document.createElement('li'));
    document.querySelector('body > ul#menu > li:last-child').append(document.createElement('a'));
    document.querySelector('body > ul#menu > li:last-child > a').append(document.createTextNode(decodeURI(getCookie('name'))));
    document.querySelector('body > ul#menu').append(document.createElement('li'));
    document.querySelector('body > ul#menu > li:last-child').setAttribute('class', 'hide');
    document.querySelector('body > ul#menu > li:last-child').append(document.createElement('a'));
    document.querySelector('body > ul#menu > li:last-child > a').setAttribute('href', '/management/members');
    document.querySelector('body > ul#menu > li:last-child > a').append(document.createTextNode('Members'));
    document.querySelector('body > ul#menu').append(document.createElement('li'));
    document.querySelector('body > ul#menu > li:last-child').setAttribute('class', 'hide');
    document.querySelector('body > ul#menu > li:last-child').append(document.createElement('a'));
    document.querySelector('body > ul#menu > li:last-child > a').setAttribute('href', '/management/companys');
    document.querySelector('body > ul#menu > li:last-child > a').append(document.createTextNode('Companys'));
    document.querySelector('body > ul#menu').append(document.createElement('li'));
    document.querySelector('body > ul#menu > li:last-child').setAttribute('class', 'hide');
    document.querySelector('body > ul#menu > li:last-child').append(document.createElement('a'));
    document.querySelector('body > ul#menu > li:last-child > a').setAttribute('href', '/logout');
    document.querySelector('body > ul#menu > li:last-child > a').append(document.createTextNode('Logout'));
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

function showPaging(total, page) {
  console.log(total, page);
  while (document.querySelectorAll('#paging > *').length)
    document.querySelectorAll('#paging > *')[0].remove();

  var pages = parseInt(total / 10) + (total % 10 === 0 ? 0 : 1);
  var start = (parseInt(page / 10) * 10) + 1
  var end = start + 9 > pages ? pages : start + 9;

  document.querySelector('#paging').append(document.createElement('li'));
  document.querySelector('#paging > li:last-child').append(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pFirst');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', 1);
  document.querySelector('#paging > li:last-child').append(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pFirst');
  document.querySelector('#paging > li:last-child > label:last-child').append(document.createTextNode('<<'));

  document.querySelector('#paging').append(document.createElement('li'));
  document.querySelector('#paging > li:last-child').append(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pPrev');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', start > 20 ? start - 10 : 1);
  document.querySelector('#paging > li:last-child').append(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pPrev');
  document.querySelector('#paging > li:last-child > label:last-child').append(document.createTextNode('<'));

  for (var p = start; p <= end; p++) {
    document.querySelector('#paging').append(document.createElement('li'));
    document.querySelector('#paging > li:last-child').append(document.createElement('input'));
    document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
    document.querySelector('#paging > li:last-child > input').setAttribute('id', 'p' + p);
    document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
    document.querySelector('#paging > li:last-child > input').setAttribute('value', p);
    if (page === p)
      document.querySelector('#paging > li:last-child > input').setAttribute('checked', true);
    document.querySelector('#paging > li:last-child').append(document.createElement('label'));
    document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'p' + p);
    document.querySelector('#paging > li:last-child > label:last-child').append(document.createTextNode(p));
  }

  document.querySelector('#paging').append(document.createElement('li'));
  document.querySelector('#paging > li:last-child').append(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pNext');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', pages > end + 1 ? start + 10 : pages);
  document.querySelector('#paging > li:last-child').append(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pNext');
  document.querySelector('#paging > li:last-child > label:last-child').append(document.createTextNode('>'));

  document.querySelector('#paging').append(document.createElement('li'));
  document.querySelector('#paging > li:last-child').append(document.createElement('input'));
  document.querySelector('#paging > li:last-child > input').setAttribute('type', 'radio');
  document.querySelector('#paging > li:last-child > input').setAttribute('id', 'pLast');
  document.querySelector('#paging > li:last-child > input').setAttribute('name', 'p');
  document.querySelector('#paging > li:last-child > input').setAttribute('value', end);
  document.querySelector('#paging > li:last-child').append(document.createElement('label'));
  document.querySelector('#paging > li:last-child > label:last-child').setAttribute('for', 'pLast');
  document.querySelector('#paging > li:last-child > label:last-child').append(document.createTextNode('>>'));

  document.querySelectorAll('#paging input').forEach(el => {
    el.addEventListener('change', function (e) {

      changePage(parseInt(document.querySelector('#paging input:checked').value));
    });
  });
}

function checkError(result) {
  if (result.error === 8) {
    alert('세션이 종료되었습니다.\n\n다시 로그인해주세요.');
    location.href = '/';
  }
  return result.error === 0;
}