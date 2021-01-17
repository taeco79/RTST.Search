var timeoutHideMessage = null;
window.onload = function () {
  console.log('Loaded.');

  document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    fetch('/login', {
      method: 'POST'
      , headers: { 'Content-Type': 'application/json' }
      , body: JSON.stringify({
        id: document.querySelector('input[name="id"]').value
        , password: document.querySelector('input[name="password"]').value
      })
    })
      .then(function (res) {
        console.log('then', res);
        return res.json();
      })
      .then(function (json) {
        console.log('then', json);
        if (json.error === 0) location.href = '/';
        else {
          document.querySelector('.tooltip').style.opacity = 1;
          document.querySelector('#message').innerText = json.message + optionalMessage(json.error);

          //   if (timeoutHideMessage !== null)
          //     timeoutHideMessage = setTimeout(function () {
          //       document.querySelector('#message').innerText = '';
          //       timeoutHideMessage = null;
          //     }, 3000);
        }
      })
      .catch(function (err) {
        console.log('catch', err);
      })
  });
}