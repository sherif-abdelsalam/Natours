import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    if (session.data.status === 'success') {
      location.assign(session.data.session.url);
    }
    // 2) Create checkout form + chanre credit card
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
