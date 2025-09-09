import { showAlert } from "./alerts";

export const login = async (email,password) => {
    try {
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      alert('error', error.message);
      }
  };
  
