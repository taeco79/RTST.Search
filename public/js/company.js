window.onload = function () {
  console.log('Management for Company Loaded.');

  showMenu();
  loadCompanys(1);

  document.querySelector('button#btnNew').addEventListener('click', function (e) {
    try {
      console.log('gg');
      ['key', 'registerNumber', 'name', 'representative'].forEach(name => {
        if (document.querySelector('input[name="' + name + '"]:valid') === null)
          throw name;
      });
      /*
            fetch('/company', {
              method: 'POST'
              , headers: {
                'Content-Type': 'application/json'
              }
              , body: JSON.stringify({
                key: document.querySelector('input[name="key"]:valid').value
                , registerNumber: document.querySelector('input[name="registerNumber"]:valid').value
                , name: document.querySelector('input[name="name"]:valid').value
                , representative: document.querySelector('input[name="representative"]:valid').value
              })
            })
              .then(function (res) { return res.json(); })
              .then(function (json) {
                if (checkError(json)) {
                  document.querySelector('input[name="key"]:valid').value = '';
                  document.querySelector('input[name="registerNumber"]:valid').value = '';
                  document.querySelector('input[name="name"]:valid').value = '';
                  document.querySelector('input[name="representative"]:valid').value = '';
      
                  loadCompanys(1);
                } else {
                  alert(json.message);
                }
              })
              .catch(err => {
                console.log('Member :: New', 'catch', err);
              });
              */
    } catch (err) {
      switch (err) {
        case 'key':
          alert(document.querySelector('input[name="' + err + '"]').getAttribute('placeholder') + '는 필수 입력항목이며,\n\n공백을 제외하여 2자 이상이어야 합니다.');
          break;
        case 'registerNumber':
          alert('사업자등록번호는 필수 입력항목이며,\n\n123-12-12345 형식 또는 숮자 10자리여야 합니다.');
          break;
        case 'name':
        case 'representative':
          alert(document.querySelector('input[name="' + err + '"]').getAttribute('placeholder') + '은 필수 입력항목이며,\n\n공백을 제외하여 2자 이상이어야 합니다.');
          break;
        default:
          console.log('Not yet >> ', err);

      }
      document.querySelector('input[name="' + err + '"]').focus();
    }
  });
  document.querySelectorAll('.detail > .tabs > input').forEach(function (el) {
    el.addEventListener('change', function (e) {
      if (e.target.value === 'info') getCompany();
      else if (e.target.value === 'demand') getDemand();
      else if (e.target.value === 'finance') getFinance();
    });
  });

  /*
  document.querySelector('#btnDel').addEventListener('click', function (e) {
    try {
      if (document.querySelectorAll('input[name="member"]:checked').length === 0)
        throw '삭제할 항목을 선택하세요.';

      var msgConfirm = '정말 삭제하시겠습니까?\n\n삭제 대상:';
      document.querySelectorAll('input[name="member"]:checked').forEach(function (el) {
        msgConfirm += '\n - ' + el.parentElement.parentElement.querySelectorAll('td')[1].innerText;
      });

      if (confirm(msgConfirm)) {
        var targets = []
        document.querySelectorAll('input[name="member"]:checked').forEach(function (el) {
          targets.push(el.value);
        });

        fetch('/members', {
          method: 'DELETE'
          , headers: {
            'Content-Type': 'application/json'
          }
          , body: JSON.stringify({
            ids: targets
          })
        })
          .then(function (res) { return res.json(); })
          .then(function (json) {
            try {
              if (!checkError(json)) throw json.message;
              if (json.data.changedRows === 0) throw "삭제하지 못했습니다.";
              if (json.data.changedRows !== targets.length) alert('일부는 삭제하지 못했습니다.');

              loadCompanys(1);
            } catch (err) {
              alert(err);
            }
          })
          .catch(err => {
            console.log('Member :: Del', 'catch', err);
          });
      }
    } catch (err) {
      alert(err);
    }
  });
  */
}

function loadCompanys(page) {
  while (document.querySelectorAll('table > tbody > tr').length)
    document.querySelector('table > tbody > tr').remove();

  document.querySelector('table > tbody').appendChild(document.createElement('tr'));
  document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
  document.querySelector('table > tbody > tr:last-child > td').setAttribute('colspan', document.querySelectorAll('table > thead > tr:first-child > th').length);
  fetch('/companys/' + page)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      try {
        if (!checkError(json)) throw '로그인하세요.';

        if (json.data.length === 0) throw '데이터가 존재하지 않습니다.';

        while (document.querySelectorAll('table > tbody > tr').length)
          document.querySelector('table > tbody > tr').remove();

        json.data.forEach(function (item) {
          document.querySelector('table > tbody').appendChild(document.createElement('tr'));

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('input'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('type', 'radio');
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('name', 'company');
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('value', item.company);

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.keyCompany;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', item.registerNumber);
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.registerNumber;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', item.name);
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.name;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', item.representative);
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.representative;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('del');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').innerText = '삭제';
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { delCompany(e.target); });

          document.querySelector('table > tbody > tr:last-child').addEventListener('click', function (e) {
            if (e.target.tagName === 'TD')
              e.target.parentElement.querySelector('input').click();
          });
        });
        document.querySelectorAll('table > tbody input[type="radio"]').forEach(function (el) {
          el.addEventListener('change', function (e) {
            document.querySelector('.detail > .tabs > input#companyInfo').checked = true;

            getCompany();
          });
        });
        showPaging(json.total, json.page);
      } catch (err) {
        document.querySelector('table > tbody > tr:last-child > td').innerText = err;
      }
    })
    .catch(err => {
      console.log('Members :: Load', 'catch', err);
    });
}

function changePage(page) {
  loadCompanys(page);
}

function editMember(obj) {
  obj.parentElement.querySelector('button.save').disabled = false;
  obj.parentElement.querySelector('button.save').classList.remove('hide');
  obj.parentElement.querySelector('button.cancel').disabled = false;
  obj.parentElement.querySelector('button.cancel').classList.remove('hide');
  obj.parentElement.querySelector('button.edit').disabled = true;
  obj.parentElement.querySelector('button.edit').classList.add('hide');
  obj.parentElement.querySelector('button.del').disabled = true;
  obj.parentElement.querySelector('button.del').classList.add('hide');

  obj.parentElement.parentElement.querySelectorAll('td')[2].innerHTML = '';
  obj.parentElement.parentElement.querySelectorAll('td')[2].appendChild(document.createElement('input'));
  obj.parentElement.parentElement.querySelectorAll('td')[2].querySelector('input').setAttribute('type', 'password');
  obj.parentElement.parentElement.querySelectorAll('td')[2].querySelector('input').setAttribute('name', 'password');
  obj.parentElement.parentElement.querySelectorAll('td')[2].querySelector('input').setAttribute('placeholder', '비밀번호 변경시에만 입력하세요.');
  obj.parentElement.parentElement.querySelectorAll('td')[2].querySelector('input').setAttribute('pattern', '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,20}$');

  obj.parentElement.parentElement.querySelectorAll('td')[3].innerHTML = '';
  obj.parentElement.parentElement.querySelectorAll('td')[3].appendChild(document.createElement('input'));
  obj.parentElement.parentElement.querySelectorAll('td')[3].querySelector('input').setAttribute('type', 'text');
  obj.parentElement.parentElement.querySelectorAll('td')[3].querySelector('input').setAttribute('name', 'name');
  obj.parentElement.parentElement.querySelectorAll('td')[3].querySelector('input').setAttribute('value', obj.parentElement.parentElement.querySelectorAll('td')[3].getAttribute('data-original'));
  obj.parentElement.parentElement.querySelectorAll('td')[3].querySelector('input').setAttribute('placeholder', '공백을 제외한 최소 2자이상 입력하세요.');
  obj.parentElement.parentElement.querySelectorAll('td')[3].querySelector('input').setAttribute('required', true);
}

function cancelMember(obj) {
  obj.parentElement.querySelector('button.save').disabled = true;
  obj.parentElement.querySelector('button.save').classList.add('hide');
  obj.parentElement.querySelector('button.cancel').disabled = true;
  obj.parentElement.querySelector('button.cancel').classList.add('hide');
  obj.parentElement.querySelector('button.edit').disabled = false;
  obj.parentElement.querySelector('button.edit').classList.remove('hide');
  obj.parentElement.querySelector('button.del').disabled = false;
  obj.parentElement.querySelector('button.del').classList.remove('hide');

  obj.parentElement.parentElement.querySelectorAll('td')[2].innerHTML = '';

  obj.parentElement.parentElement.querySelectorAll('td')[3].innerText = obj.parentElement.parentElement.querySelectorAll('td')[3].getAttribute('data-original');
}

function saveMember(obj) {
  try {
    ['password', 'name'].forEach(name => {
      if (obj.parentElement.parentElement.querySelector('input[name="' + name + '"]:valid') === null)
        throw name;
    });
    fetch('/member/' + obj.parentElement.parentElement.querySelector('input[type="checkbox"]').value, {
      method: 'PUT'
      , headers: {
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify({
        password: obj.parentElement.parentElement.querySelector('input[name="password"]').value
        , name: obj.parentElement.parentElement.querySelector('input[name="name"]').value
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (checkError(json)) {
          if (document.querySelectorAll('input[type="checkbox"][value="' + json.info.key + '"]').length) {
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[2].innerText = '';
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[3].setAttribute('data-original', json.info.name);
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[3].innerText = json.info.name;

            cancelMember(document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement);
          }
        } else {
          alert(json.message);
        }
      })
      .catch(err => {
        console.log('Member :: New', 'catch', err);
      });
  } catch (err) {
    if (document.querySelector('input[name="password"]') !== null) {
      switch (err) {
        case 'password':
          alert('영문자의 대/소문자, 숫자 그리고 특수문자를 포함하여 8~20자이어야 합니다.');
          break;
        case 'name':
          alert('이름은 필수 입력항목이며,\n\n공백을 제외하여 2자 이상이어야 합니다.');
          break;

      }
      obj.parentElement.parentElement.querySelector('input[name="' + err + '"]').focus();
    }
  }
}

function getCompany() {
  if (document.querySelector('input[name="company"]:checked') === null)
    return;

  fetch('/htm/company.htm')
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      document.querySelector('.detail > .content').innerHTML = '<table><tbody><tr><td colspan="4"></th></tr></tbody></table>';
      fetch('/company/' + document.querySelector('input[name="company"]:checked').value)
        .then(function (res) { return res.json(); })
        .then(function (json) {
          for (const [field, value] of Object.entries(json.data[0])) {
            html = html.replace('##' + field + '##', value === null ? '-' : value);
          }
          document.querySelector('.detail > .content').innerHTML = html;
        })
        .catch(function (err) { console.log(err) });
    })
    .catch(function (err) {
      console.log(err);
    });
}

function getDemand() {
  if (document.querySelector('input[name="company"]:checked') === null)
    return;

  fetch('/htm/demand.htm')
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      document.querySelector('.detail > .content').innerHTML = '<table><tbody><tr><td colspan="4"></th></tr></tbody></table>';
      fetch('/demand/' + document.querySelector('input[name="company"]:checked').value)
        .then(function (res) { return res.json(); })
        .then(function (json) {
          for (const [field, value] of Object.entries(json.data[0])) {
            html = html.replace('##' + field + '##', value === null ? '-' : value);
          }
          document.querySelector('.detail > .content').innerHTML = html;
        })
        .catch(function (err) { console.log(err) });
    })
    .catch(function (err) {
      console.log(err);
    });
}

function getFinance() {
  if (document.querySelector('input[name="company"]:checked') === null)
    return;

  fetch('/htm/finance.htm')
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      document.querySelector('.detail > .content').innerHTML = '<table><tbody><tr><td colspan="4"></th></tr></tbody></table>';
      fetch('/finance/' + document.querySelector('input[name="company"]:checked').value)
        .then(function (res) { return res.json(); })
        .then(function (json) {
          document.querySelector('.detail > .content').innerHTML = html;

          var target = document.querySelector('.detail > .content > table');
          json.data.forEach(function (item) {
            target.querySelector('tbody').appendChild(document.createElement('tr'));
            target.querySelector('tbody > tr:last-child').setAttribute('company', item.company);

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.year);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.year === null ? '-' : item.year;

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.quarter);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.quarter === null ? '-' : item.quarter;

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.Assets);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.Assets === null ? '-' : item.Assets.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.Debt);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.Debt === null ? '-' : item.Debt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.Sale);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.Sale === null ? '-' : item.Sale.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.Profit);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.Profit === null ? '-' : item.Profit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            target.querySelector('tbody > tr:last-child > td:last-child').setAttribute('data-original', item.NetProfit);
            target.querySelector('tbody > tr:last-child > td:last-child').innerText = item.NetProfit === null ? '-' : item.NetProfit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");



            // target.querySelector('tbody > tr:last-child').appendChild(document.createElement('td'));
            // target.querySelector('tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').disabled = true;
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('save');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('hide');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').innerText = '저장';
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { saveMember(e.target); });
            // target.querySelector('tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').disabled = true;
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('cancel');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('hide');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').innerText = '취소';
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { cancelMember(e.target); });
            // target.querySelector('tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('edit');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').innerText = '수정';
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { editMember(e.target); });
            // target.querySelector('tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').classList.add('del');
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').innerText = '삭제';
            // target.querySelector('tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { delMember(e.target); });
          });
        })
        .catch(function (err) { console.log(err) });
    })
    .catch(function (err) {
      console.log(err);
    });
}

function delCompany(obj) {
  console.log(obj.parent);
  var confirmMessage = '정말 삭제하시겠습니까?\n\n삭제 대상:\n - '
    + obj.parentElement.parentElement.querySelectorAll('td')[3].innerText
    + (obj.parentElement.parentElement.querySelectorAll('td')[2].innerText === '' ? '' : ' (' + obj.parentElement.parentElement.querySelectorAll('td')[2].innerText + ')');
  if (confirm(confirmMessage)) {

    fetch('/member/' + obj.parentElement.parentElement.querySelectorAll('td')[0].querySelector('input').value, {
      method: 'DELETE'
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        try {
          if (!checkError(json)) throw json.message;
          if (json.data.changedRows === 0) throw "삭제하지 못했습니다.";

          loadCompanys(1);
        } catch (err) {
          alert(err);
        }
      })
      .catch(err => {
        console.log('Member :: Del', 'catch', err);
      });
  }
}