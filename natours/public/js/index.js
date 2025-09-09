import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';
import { logout } from './logout';

const loginForm = document.querySelector('.login-form');
const mapBox = document.getElementById('map');
const logoutBt = document.querySelector('.logout_bt');

if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (logoutBt) {
  logoutBt.addEventListener('click', logout);
}
