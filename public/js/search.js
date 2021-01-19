var timeoutHideMessage = null;

var arrString = {
  Patent: ['특허등록번호', '특허출원번호']
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
    { id: 'name', title: '기업명' }
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
    { id: 'name', title: '기업명' }
    , { id: 'registerNumber', title: '사업자등록번호' }
    , { id: 'businessTypes', title: '사업부문명' }
    , { id: 'businessItems', title: '제품명' }
  ]
};

var arrFilterPatent = [
  { id: 1, title: '국내법인' }
  , { id: 2, title: '기타법인/국가기관' }
  , { id: 5, title: '외국법인' }
];

var arrFilterCompany = [
  { id: 'demandingTechnology', title: '수요기술' }
  , { id: 'technologyTransferDepartment', title: '기술이전 담당부서' }
  , { id: 'technologyTransfer', title: '기술이전' }
  , { id: 'isKOSDAQ', title: '상장' }
  , { id: 'isINNOBIZ', title: '이노비즈 인증' }
  , { id: 'isHidenChampion', title: '강소기업 인증' }
  , { id: 'isVenture', title: '벤처기업 인증' }
];

window.onload = function () {
  console.log('Search Loaded.');
  LIMIT = 9;

  showMenu();

  try {
    if (SEARCH.output.status !== 'Found')
      throw '검색 결과가 없습니다.';

    // document.querySelector('#frame').append(document.createElement('ul'));
    // document.querySelector('#frame > ul:last-child').setAttribute('id', 'result');

    showSummary(SEARCH.input.type, SEARCH.input.value);
    showFilter(SEARCH.output.type, SEARCH.input.value);
    // showResult(SEARCH.output.type, SEARCH.output.value, 1);
    showResult(SEARCH.output.type, SEARCH.output.value, 1);
  } catch (err) {
    console.log('Error >> ', err);
  }
}

function showFilter(type, value) {
  document.querySelector('#frame').append(document.createElement('h2'));
  document.querySelector('#frame > h2:last-child').innerText = '검색 결과';

  document.querySelector('#frame').append(document.createElement('ul'));
  document.querySelector('#frame > ul:last-child').setAttribute('id', 'filter');

  while (document.querySelectorAll('#filter > li').length)
    document.querySelectorAll('#filter > li')[0].remove();

  (arrString.Company.includes(type) ? arrFilterCompany : arrFilterPatent).forEach(item => {
    document.querySelector('#filter').append(document.createElement('li'));
    document.querySelector('#filter > li:last-child').append(document.createElement('input'));
    document.querySelector('#filter > li:last-child > input').setAttribute('type', 'checkbox');
    document.querySelector('#filter > li:last-child > input').setAttribute('id', 'currentName' + item.id);
    document.querySelector('#filter > li:last-child > input').setAttribute('name', 'currentName[]');
    document.querySelector('#filter > li:last-child > input').setAttribute('value', item.id);
    document.querySelector('#filter > li:last-child').append(document.createElement('label'));
    document.querySelector('#filter > li:last-child > label').setAttribute('for', 'currentName' + item.id);
    document.querySelector('#filter > li:last-child > label').append(document.createTextNode(item.title));
  });
  document.querySelectorAll('#filter input').forEach(el => {
    el.addEventListener('change', function (e) {
      showResult(SEARCH.output.type, SEARCH.output.value, 1);
    });
  });
}

function showSummary(type, value) {
  document.querySelector('#frame').append(document.createElement('h1'));
  document.querySelector('#frame > h1').innerText = type;
  document.querySelector('#frame > h1').appendChild(document.createElement('span'));
  document.querySelector('#frame > h1 > span').innerText = value;

  document.querySelector('#frame').append(document.createElement('h2'));
  document.querySelector('#frame > h2').innerText = '요약';

  document.querySelector('#frame').append(document.createElement('ul'));
  document.querySelector('#frame > ul:last-child').setAttribute('id', 'summary');
  fetch('/summary/' + type + '/' + value)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (checkError(json)) {
        console.log('Summary', 'then', json);
        var arrSummary = null;
        if (arrString.Patent.includes(type))
          arrSummary = arrSummaryField.Patent;
        else if (arrString.Company.includes(type))
          arrSummary = arrSummaryField.Company;
        else
          throw type;

        arrSummary.forEach(item => {
          document.querySelector('#summary').append(document.createElement('li'));
          document.querySelector('#summary > li:last-child').setAttribute('id', item.id);
          document.querySelector('#summary > li:last-child').append(document.createElement('div'));
          document.querySelector('#summary > li:last-child > div:last-child').innerText = item.title;
          document.querySelector('#summary > li:last-child').append(document.createElement('div'));
          document.querySelector('#summary > li:last-child > div:last-child').append(document.createTextNode(eval('json.data.' + item.id) === null ? '-' : eval('json.data.' + item.id)));
        });
      } else {
        document.querySelector('#summary').append(document.createElement('li'));
        document.querySelector('#summary > li:last-child').classList.add('error')
        document.querySelector('#summary > li:last-child').innerText = json.message;
      }
    })
    .catch(err => {
      console.log('Summary', 'catch', err);
    });
}

function showResult(type, value, p) {
  if (document.querySelectorAll('#result').length === 0) {
    document.querySelector('#frame').append(document.createElement('div'));
    document.querySelector('#frame > div:last-child').setAttribute('id', 'result');
  }

  document.querySelector('#result').innerHTML = '';

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
      while (document.querySelectorAll('#result > div').length)
        document.querySelector('#result > div').remove();

      if (checkError(json)) {
        console.log('Summarys', 'then', json);

        json.data.forEach(record => {
          document.querySelector('#result').append(document.createElement('a'));
          if (arrString.Company.includes(type)) {
            document.querySelector('#result > a:last-child').classList.add('company');
            document.querySelector('#result > a:last-child').setAttribute('target', '_blank');
            document.querySelector('#result > a:last-child').setAttribute('href', '/detail/company/' + record.company);
            if (record.introductoryIntention === 'Y')
              document.querySelector('#result > a:last-child').classList.add('introductoryIntention');
            document.querySelector('#result > a:last-child').append(document.createElement('ul'));
            arrResultField.Company.forEach(item => {
              document.querySelector('#result > a:last-child > ul').append(document.createElement('li'));
              document.querySelector('#result > a:last-child > ul > li:last-child').setAttribute('id', item.id);
              document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('div'));
              document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').innerText = item.title;
              switch (item.id) {
                // case 'name':
                //   document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('a'));
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').setAttribute('target', '_blank');
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').setAttribute('href', '/detail/company/' + record.key);
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').append(document.createTextNode(eval('record.' + item.id)));
                //   break;
                default:
                  document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('div'));
                  document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').classList.add(['사업부문명', '제품명'].includes(item.title) ? 'ellipsis-2' : 'ellipsis-1')
                  document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').append(document.createTextNode(eval('record.' + item.id)));
              }
            });

            showPaging(SEARCH.output.value.length, json.page, 9);
          } else if (arrString.Patent.includes(type)) {
            document.querySelector('#result > a:last-child').classList.add('patent');
            document.querySelector('#result > a:last-child').setAttribute('target', '_blank');
            document.querySelector('#result > a:last-child').setAttribute('href', '/detail/patent/' + record.registerNumber);
            document.querySelector('#result > a:last-child').append(document.createElement('ul'));
            arrResultField.Patent.forEach(item => {
              document.querySelector('#result > a:last-child > ul').append(document.createElement('li'));
              document.querySelector('#result > a:last-child > ul > li:last-child').setAttribute('id', item.id);
              document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('div'));
              document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').innerText = item.title;
              switch (item.id) {
                // case 'registerNumber':
                //   document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('a'));
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').setAttribute('target', '_blank');
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').setAttribute('href', '/detail/patent/' + record.registerNumber);
                //   document.querySelector('#result > a:last-child > ul > li:last-child > a').append(document.createTextNode(eval('record.' + item.id)));
                //   break;
                default:
                  document.querySelector('#result > a:last-child > ul > li:last-child').append(document.createElement('div'));
                  document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').classList.add(['요약문'].includes(item.title) ? 'ellipsis-2' : 'ellipsis-1')
                  document.querySelector('#result > a:last-child > ul > li:last-child > div:last-child').append(document.createTextNode(eval('record.' + item.id)));
              }
            });

            showPaging(SEARCH.output.value.length, json.page, 8);
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
  showResult(SEARCH.output.type, SEARCH.output.value, page);
}
