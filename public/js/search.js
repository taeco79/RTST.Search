var timeoutHideMessage = null;

var arrString = {
  Patent: ['특허등록번호']
  , Company: ['사업자등록번호', '기업코드']
};

var arrSummaryField = {
  Patent: [
    { id: 'inventionTitle', title: '발명의 명칭' }
    , { id: 'registerNumber', title: '특허등록번호' }
    , { id: 'registerDate', title: '등록일' }
    , { id: 'ipcNumber', title: '메인 IPC' }
    , { id: 'astrtCont', title: '요약문' }
  ]
  , Company: [
    { id: 'key', title: '기업코드' }
    , { id: 'name', title: '기업명' }
    , { id: 'registerNumber', title: '사업자등록번호' }
    , { id: 'businessTypes', title: '사업부문명' }
    , { id: 'businessItems', title: '제품명' }
  ]
};

var arrResultField = {
  Patent: [
    { id: 'inventionTitle', title: '발명의 명칭' }
    , { id: 'registerNumber', title: '특허등록번호' }
    , { id: 'registerDate', title: '등록일' }
    , { id: 'ipcNumber', title: '메인 IPC' }
    , { id: 'astrtCont', title: '요약문' }
  ]
  , Company: [
    { id: 'key', title: '기업코드' }
    , { id: 'name', title: '기업명' }
    , { id: 'registerNumber', title: '사업자등록번호' }
    , { id: 'businessTypes', title: '사업부문명' }
    , { id: 'businessItems', title: '제품명' }
  ]
};

var arrFilterPatent = [
  { id: 1, title: '국내법인' }
  , { id: 2, title: '국가기관' }
  , { id: 5, title: '외국법인' }
];

var arrFilterCompany = [
  { id: 'demandingTechnology', title: '수요기술' }
  , { id: 'technologyTransferDepartment', title: '기술이전전담부서' }
  , { id: 'technologyTransfer', title: '기술이전' }
  , { id: 'isKOSDAQ', title: '상장' }
  , { id: 'isINNOBIZ', title: '이노비즈 인증' }
  , { id: 'isHidenChampion', title: '강소기업 인증' }
  , { id: 'isVenture', title: '벤처기업 인증' }
];

window.onload = function () {
  console.log('Search Loaded.');

  try {
    if (SEARCH.output.status !== 'Found')
      throw '검색 결과가 없습니다.';

    document.querySelector('body').append(document.createElement('fieldset'));
    document.querySelector('body > fieldset:last-child').setAttribute('id', 'filter');
    document.querySelector('body').append(document.createElement('fieldset'));
    document.querySelector('body > fieldset:last-child').setAttribute('id', 'summary');
    document.querySelector('body').append(document.createElement('ul'));
    document.querySelector('body > ul:last-child').setAttribute('id', 'result');
    document.querySelector('body').append(document.createElement('ul'));
    document.querySelector('body > ul:last-child').setAttribute('id', 'paging');

    showFilter(SEARCH.output.type, SEARCH.input.value);
    showSummary(SEARCH.input.type, SEARCH.input.value);
    showPaging(SEARCH.output.value.length, 1);
    showSummarys(SEARCH.output.type, SEARCH.output.value, 1);
  } catch (err) {
    console.log('Error >> ', err);
  }
}

function showFilter(type, value) {
  while (document.querySelectorAll('#filter > ul > li').length)
    document.querySelectorAll('#filter > ul > li')[0].remove();

  document.querySelector('#filter').append(document.createElement('legend'));
  document.querySelector('#filter > legend').append(document.createTextNode('필터'));
  document.querySelector('#filter').append(document.createElement('ul'));

  (arrString.Company.includes(type) ? arrFilterCompany : arrFilterPatent).forEach(item => {
    document.querySelector('#filter > ul').append(document.createElement('li'));
    document.querySelector('#filter > ul > li:last-child').append(document.createElement('input'));
    document.querySelector('#filter > ul > li:last-child > input').setAttribute('type', 'checkbox');
    document.querySelector('#filter > ul > li:last-child > input').setAttribute('id', 'currentName' + item.id);
    document.querySelector('#filter > ul > li:last-child > input').setAttribute('name', 'currentName[]');
    document.querySelector('#filter > ul > li:last-child > input').setAttribute('value', item.id);
    document.querySelector('#filter > ul > li:last-child').append(document.createElement('label'));
    document.querySelector('#filter > ul > li:last-child > label').setAttribute('for', 'currentName' + item.id);
    document.querySelector('#filter > ul > li:last-child > label').append(document.createTextNode(item.title));
  });
  document.querySelectorAll('#filter input').forEach(el => {
    el.addEventListener('change', function (e) {
      showSummarys(SEARCH.output.type, SEARCH.output.value, 1);
    });
  });
}

function showSummary(type, value) {
  document.querySelector('#summary').append(document.createElement('legend'));
  document.querySelector('#summary > legend').append(document.createTextNode(type + '<' + value + '> 요약 정보'));
  document.querySelector('#summary').append(document.createElement('ul'));
  fetch('/summary/' + type + '/' + value)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {
        console.log('Summary', 'then', json);
        if (arrString.Patent.includes(type))
          arrSummaryField.Patent.forEach(item => {
            document.querySelector('#summary > ul').append(document.createElement('li'));
            document.querySelector('#summary > ul > li:last-child').setAttribute('id', item.id);
            document.querySelector('#summary > ul > li:last-child').append(document.createTextNode(item.title + ' : '));
            document.querySelector('#summary > ul > li:last-child').append(document.createElement('span'));
            document.querySelector('#summary > ul > li:last-child > span').append(document.createTextNode(eval('json.data.' + item.id)));
          });
        else if (arrString.Company.includes(type))
          arrSummaryField.Company.forEach(item => {
            document.querySelector('#summary > ul').append(document.createElement('li'));
            document.querySelector('#summary > ul > li:last-child').setAttribute('id', item.id);
            document.querySelector('#summary > ul > li:last-child').append(document.createTextNode(item.title + ' : '));
            document.querySelector('#summary > ul > li:last-child').append(document.createElement('span'));
            document.querySelector('#summary > ul > li:last-child > span').append(document.createTextNode(eval('json.data.' + item.id)));
          });
        else
          console.log(type);
      } else {
        console.log('Here');
      }
    })
    .catch(err => {
      console.log('Summary', 'catch', err);
    });
}

function showSummarys(type, value, p) {
  var filters = [];
  document.querySelectorAll('#filter input:checked').forEach(el => {
    filters.push(el.value);
  });

  fetch('/summarys/' + type, {
    method: 'POST'
    , headers: {
      'Content-Type': 'application/json'
    }
    , body: JSON.stringify({
      values: value
      , filter: filters
      , page: p
    })
  })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      while (document.querySelectorAll('#result > *').length)
        document.querySelectorAll('#result > *')[0].remove();
      if (checkError(json)) {
        console.log('Summarys', 'then', json);

        json.data.forEach(record => {
          document.querySelector('#result').append(document.createElement('li'));
          if (arrString.Company.includes(type)) {
            document.querySelector('#result > li:last-child').append(document.createElement('ul'));
            arrResultField.Company.forEach(item => {
              document.querySelector('#result > li:last-child > ul').append(document.createElement('li'));
              document.querySelector('#result > li:last-child > ul > li:last-child').setAttribute('id', item.id);
              document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createTextNode(item.title + ' : '));
              switch (item.id) {
                case 'name':
                  document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createElement('a'));
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').setAttribute('target', '_blank');
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').setAttribute('href', '/detail/company/' + record.key);
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').append(document.createTextNode(eval('record.' + item.id)));
                  break;
                default:
                  document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createElement('span'));
                  document.querySelector('#result > li:last-child > ul > li:last-child > span').append(document.createTextNode(eval('record.' + item.id)));
              }
            });

          } else if (arrString.Patent.includes(type)) {
            document.querySelector('#result > li:last-child').append(document.createElement('ul'));
            arrResultField.Patent.forEach(item => {
              document.querySelector('#result > li:last-child > ul').append(document.createElement('li'));
              document.querySelector('#result > li:last-child > ul > li:last-child').setAttribute('id', item.id);
              document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createTextNode(item.title + ' : '));
              switch (item.id) {
                case 'registerNumber':
                  document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createElement('a'));
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').setAttribute('target', '_blank');
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').setAttribute('href', '/detail/patent/' + record.registerNumber);
                  document.querySelector('#result > li:last-child > ul > li:last-child > a').append(document.createTextNode(eval('record.' + item.id)));
                  break;
                default:
                  document.querySelector('#result > li:last-child > ul > li:last-child').append(document.createElement('span'));
                  document.querySelector('#result > li:last-child > ul > li:last-child > span').append(document.createTextNode(eval('record.' + item.id)));
              }
            });

          } else {
            console.log('#########################');
            console.log(type);
            console.log('#########################');
          }

        });
      } else {
        console.log('Here');
      }
    })
    .catch(err => {
      console.log('Summary', 'catch', err);
    });
}

function changePage(page) {
  showSummarys(SEARCH.output.type, SEARCH.output.value, page);
}
