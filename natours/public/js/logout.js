import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const response = await fetch('/api/v1/users/logout');
    const res = await response.json();
    console.log(res);

    if (res.status == 'success') {
      showAlert('success', 'You Logged Out Successfully');
      location.reload(true);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error Loggint out. Try Again!');
  }
};
