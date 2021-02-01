window.onload = function () {
  console.log('Management for Member Loaded.');

  showMenu();
  loadMembers(1);

  document.querySelector('input[name="keyword"]').addEventListener('keypress', function (e) {
    if (e.key === 'Enter')
      loadMembers(1);
  });

  document.querySelector('#btnSearch').addEventListener('click', function (e) {
    loadMembers(1);
  });

  document.querySelector('button#btnNew').addEventListener('click', function (e) {
    try {
      ['id', 'password', 'name'].forEach(name => {
        if (document.querySelector('input[name="' + name + '"]:valid') === null)
          throw name;
      });

      fetch('/member', {
        method: 'POST'
        , headers: {
          'Content-Type': 'application/json'
        }
        , body: JSON.stringify({
          id: document.querySelector('input[name="id"]:valid').value
          , password: document.querySelector('input[name="password"]:valid').value
          , name: document.querySelector('input[name="name"]:valid').value
          , grade: document.querySelector('input[name="gradeNew"]:checked').value
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (checkError(json)) {
            document.querySelector('input[name="id"]:valid').value = '';
            document.querySelector('input[name="password"]:valid').value = '';
            document.querySelector('input[name="name"]:valid').value = '';

            loadMembers(1);
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
          case 'id':
            alert('아이디는 필수 입력항목이며,\n\n이메일 형식이어야 합니다.');
            break;
          case 'password':
            alert('비밀번호는 필수 입력항목이며,\n\n영문자의 대/소문자, 숫자 그리고 특수문자를 포함하여 8~20자이어야 합니다.');
            break;
          case 'name':
            alert('이름은 필수 입력항목이며,\n\n공백을 제외하여 2자 이상이어야 합니다.');
            break;

        }
        document.querySelector('input[name="' + err + '"]').focus();
      }
    }
  });

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

              loadMembers(1);
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
}

function loadMembers(page) {
  while (document.querySelectorAll('table > tbody > tr').length)
    document.querySelector('table > tbody > tr').remove();

  document.querySelector('table > tbody').appendChild(document.createElement('tr'));
  document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
  document.querySelector('table > tbody > tr:last-child > td').setAttribute('colspan', document.querySelectorAll('table > thead > tr:first-child > th').length);

  var url = '/members/' + page;
  if (document.querySelector('input[name="keyword"]').value !== '')
    url += '/' + encodeURI(document.querySelector('input[name="keyword"]').value)
  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      try {
        var TODAY = (new Date()).toISOString().replace(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, '');
        if (!checkError(json)) throw '로그인하세요.';

        if (json.data.length === 0) throw '데이터가 존재하지 않습니다.';

        while (document.querySelectorAll('table > tbody > tr').length)
          document.querySelector('table > tbody > tr').remove();

        json.data.forEach(function (item) {
          document.querySelector('table > tbody').appendChild(document.createElement('tr'));

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('input'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('type', 'checkbox');
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('name', 'member');
          document.querySelector('table > tbody > tr:last-child > td:last-child > input').setAttribute('value', item.key);

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.id;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', '');

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', item.name);
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.name;

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('data-original', item.grade);
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.grade === 9 ? '관리자' : '일반';

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('align', 'center');
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.entry.match(TODAY) === null ? item.entry.replace(/\s\d{2}:\d{2}:\d{2}$/, '') : item.entry.replace(/^\d{4}-\d{2}-\d{2}\s/, '');

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('align', 'center');
          document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.update.match(TODAY) === null ? item.update.replace(/\s\d{2}:\d{2}:\d{2}$/, '') : item.update.replace(/^\d{4}-\d{2}-\d{2}\s/, '');

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').setAttribute('align', 'center');
          console.log(item.logined);
          if (item.logined !== null)
            document.querySelector('table > tbody > tr:last-child > td:last-child').innerText = item.logined.match(TODAY) === null ? item.logined.replace(/\s\d{2}:\d{2}:\d{2}$/, '') : item.logined.replace(/^\d{4}-\d{2}-\d{2}\s/, '');

          document.querySelector('table > tbody > tr:last-child').appendChild(document.createElement('td'));
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').disabled = true;
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('save');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('hide');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').innerText = '저장';
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { saveMember(e.target); });
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').disabled = true;
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('cancel');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('hide');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').innerText = '취소';
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { cancelMember(e.target); });
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('edit');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').innerText = '수정';
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { editMember(e.target); });
          document.querySelector('table > tbody > tr:last-child > td:last-child').appendChild(document.createElement('button'));
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').classList.add('del');
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').innerText = '삭제';
          document.querySelector('table > tbody > tr:last-child > td:last-child > button:last-child').addEventListener('click', function (e) { delMember(e.target); });
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
  loadMembers(page);
}

function editMember(obj) {
  if (document.querySelector('input[name="gradeEdit"]') !== null) {
    alert('수정중인 항목을 먼저 완료하세요.');
    return null;
  }
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

  obj.parentElement.parentElement.querySelectorAll('td')[4].innerHTML = '';
  obj.parentElement.parentElement.querySelectorAll('td')[4].appendChild(document.createElement('input'));
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('type', 'radio');
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('name', 'gradeEdit');
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('id', 'grade-normal-' + obj.parentElement.parentElement.querySelector('input[type="checkbox"]').value);
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('value', 1);
  if (obj.parentElement.parentElement.querySelectorAll('td')[4].getAttribute('data-original') !== '9')
    obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('checked', true);
  obj.parentElement.parentElement.querySelectorAll('td')[4].appendChild(document.createElement('label'));
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('label:last-child').setAttribute('for', 'grade-normal-' + obj.parentElement.parentElement.querySelector('input[type="checkbox"]').value);
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('label:last-child').appendChild(document.createTextNode('일반'));
  obj.parentElement.parentElement.querySelectorAll('td')[4].appendChild(document.createElement('input'));
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('type', 'radio');
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('name', 'gradeEdit');
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('id', 'grade-manager-' + obj.parentElement.parentElement.querySelector('input[type="checkbox"]').value);
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('value', 9);
  if (obj.parentElement.parentElement.querySelectorAll('td')[4].getAttribute('data-original') === '9')
    obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('input:last-child').setAttribute('checked', true);
  obj.parentElement.parentElement.querySelectorAll('td')[4].appendChild(document.createElement('label'));
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('label:last-child').setAttribute('for', 'grade-manager-' + obj.parentElement.parentElement.querySelector('input[type="checkbox"]').value);
  obj.parentElement.parentElement.querySelectorAll('td')[4].querySelector('label:last-child').appendChild(document.createTextNode('관리자'));

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
  obj.parentElement.parentElement.querySelectorAll('td')[4].innerText = obj.parentElement.parentElement.querySelectorAll('td')[4].getAttribute('data-original') === '1' ? '일반' : '관리자';
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
        , grade: obj.parentElement.parentElement.querySelector('input[name="gradeEdit"]:checked').value
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (checkError(json)) {
          if (document.querySelectorAll('input[type="checkbox"][value="' + json.info.key + '"]').length) {
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[2].innerText = '';
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[3].setAttribute('data-original', json.info.name);
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[3].innerText = json.info.name;
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[4].setAttribute('data-original', json.info.grade);
            document.querySelector('input[type="checkbox"][value="' + json.info.key + '"]').parentElement.parentElement.querySelectorAll('td')[4].innerText = json.info.grade === '9' ? '관리자' : '일반';

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

function delMember(obj) {
  console.log(obj.parent);
  if (confirm('정말 삭제하시겠습니까?\n\n삭제 대상:\n - ' + obj.parentElement.parentElement.querySelectorAll('td')[1].innerText)) {

    fetch('/member/' + obj.parentElement.parentElement.querySelectorAll('td')[0].querySelector('input').value, {
      method: 'DELETE'
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        try {
          if (!checkError(json)) throw json.message;
          if (json.data.changedRows === 0) throw "삭제하지 못했습니다.";

          loadMembers(1);
        } catch (err) {
          alert(err);
        }
      })
      .catch(err => {
        console.log('Member :: Del', 'catch', err);
      });
  }
}