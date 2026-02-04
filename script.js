// Mobile navigation toggle
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.querySelector('.navbar');
if (mobileMenu && navbar) {
  mobileMenu.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });
}

// ---------------------------------------------------------
// Booking Logic
// ---------------------------------------------------------

let bookingData = {
  checkin: '',
  checkout: '',
  guests: '2',
  roomName: '',
  roomPrice: 0,
  totalPrice: 0,
  nights: 0
};

// 1. Handle "Search Availability" with Simulation
const searchForm = document.getElementById('search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    if (!checkin || !checkout) {
      alert('נא לבחור תאריכי הגעה ועזיבה');
      return;
    }

    // Save state
    bookingData.checkin = checkin;
    bookingData.checkout = checkout;
    bookingData.guests = guests;

    // Calculate nights
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const timeDiff = d2.getTime() - d1.getTime();
    bookingData.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (bookingData.nights <= 0) {
      alert('תאריך העזיבה חייב להיות אחרי תאריך ההגעה');
      return;
    }

    /* ---------------------------------------------------------
       SIMULATE AVAILABILITY
       We use a simple hash of the date string to make it consistent.
       If Hash % 3 === 0, then a room might be taken.
    --------------------------------------------------------- */

    // Reset all rooms first
    document.querySelectorAll('.room-card').forEach(card => {
      card.classList.remove('sold-out');
      const btn = card.querySelector('.book-now-btn');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'שריין חדר זה';
      }
    });

    const dateHash = (checkin + checkout).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rooms = document.querySelectorAll('.room-card');

    // Logic: In high season (hash is even), random rooms are sold out
    let availableCount = 0;

    rooms.forEach((card, index) => {
      // Create a pseudo-random determination for this specific room & date combo
      const isSoldOut = (dateHash + index) % 3 === 0;

      if (isSoldOut) {
        card.classList.add('sold-out');
        const btn = card.querySelector('.book-now-btn');
        if (btn) {
          btn.disabled = true;
          btn.innerText = 'אזל במלאי';
        }
      } else {
        availableCount++;
      }
    });

    // Scroll to rooms to show results
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      if (availableCount === 0) {
        alert(`לצערנו כל החדרים תפוסים בתאריכים ${checkin} עד ${checkout}. נסו תאריכים אחרים.`);
      } else {
        // Optional success notification could go here
      }
    }, 800);
  });
}

// 2. Handle "Book Now" clicked on rooms
const modal = document.getElementById('checkout-modal');
const closeModal = document.querySelector('.close-modal');
const summaryDiv = document.getElementById('order-summary');

document.querySelectorAll('.book-now-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Check if dates are selected
    if (!bookingData.checkin || !bookingData.checkout) {
      alert('אנא בחרו תאריכים בחלק העליון של הדף ולחצו על "חפש" קודם.');
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Get room data
    const card = e.target.closest('.room-card');
    bookingData.roomName = card.getAttribute('data-name');
    bookingData.roomPrice = parseInt(card.getAttribute('data-price'));
    bookingData.totalPrice = bookingData.roomPrice * bookingData.nights;

    // Update Modal UI
    summaryDiv.innerHTML = `
      <p><strong>חדר:</strong> ${bookingData.roomName}</p>
      <p><strong>תאריכים:</strong> ${bookingData.checkin} ➡ ${bookingData.checkout}</p>
      <p><strong>לילות:</strong> ${bookingData.nights}</p>
      <p><strong>אורחים:</strong> ${bookingData.guests}</p>
      <p style="font-size: 1.2rem; color: var(--color-gold); margin-top:10px;">
         <strong>סה"כ לתשלום: ₪${bookingData.totalPrice.toLocaleString()}</strong>
      </p>
    `;

    // Update total in payment button
    updateTotalAmount();

    // Show Modal
    modal.classList.remove('hidden');
  });
});

// Close Modal logic
if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

// 3. Credit Card Form Handling & Validation

// Card number formatting (add spaces every 4 digits)
const cardNumberInput = document.getElementById('card-number');
if (cardNumberInput) {
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');

    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    e.target.value = formattedValue;
  });
}

// Expiry date formatting (MM/YY)
const cardExpiryInput = document.getElementById('card-expiry');
if (cardExpiryInput) {
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    e.target.value = value;
  });
}

// CVV - numbers only
const cardCvvInput = document.getElementById('card-cvv');
if (cardCvvInput) {
  cardCvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
}

// Update total amount in button
const updateTotalAmount = () => {
  const totalAmountSpan = document.getElementById('total-amount');
  if (totalAmountSpan) {
    totalAmountSpan.textContent = bookingData.totalPrice.toLocaleString();
  }
};

// Validate card number using Luhn algorithm
const validateCardNumber = (number) => {
  const digits = number.replace(/\s/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Validate expiry date
const validateExpiry = (expiry) => {
  const parts = expiry.split('/');
  if (parts.length !== 2) return false;

  const month = parseInt(parts[0]);
  const year = parseInt('20' + parts[1]);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

// Validate CVV
const validateCVV = (cvv) => {
  return cvv.length === 3 || cvv.length === 4;
};

// Handle payment form submission
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const guestName = document.getElementById('guest-name').value;
    const guestEmail = document.getElementById('guest-email').value;
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    const cardHolder = document.getElementById('card-holder').value;

    // Validate all fields
    let hasError = false;

    if (!guestName || guestName.length < 2) {
      alert('נא להזין שם מלא תקין');
      return;
    }

    if (!guestEmail || !guestEmail.includes('@')) {
      alert('נא להזין כתובת אימייל תקינה');
      return;
    }

    if (!validateCardNumber(cardNumber)) {
      alert('מספר כרטיס אשראי לא תקין');
      cardNumberInput.classList.add('error');
      setTimeout(() => cardNumberInput.classList.remove('error'), 500);
      return;
    }

    if (!validateExpiry(cardExpiry)) {
      alert('תוקף כרטיס לא תקין או שפג');
      cardExpiryInput.classList.add('error');
      setTimeout(() => cardExpiryInput.classList.remove('error'), 500);
      return;
    }

    if (!validateCVV(cardCvv)) {
      alert('CVV לא תקין');
      cardCvvInput.classList.add('error');
      setTimeout(() => cardCvvInput.classList.remove('error'), 500);
      return;
    }

    if (!cardHolder || cardHolder.length < 3) {
      alert('נא להזין שם בעל הכרטיס');
      return;
    }

    // Disable button and show processing
    const payButton = document.getElementById('pay-button');
    const originalText = payButton.innerHTML;
    payButton.disabled = true;
    payButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> מעבד תשלום...';

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const isSuccess = Math.random() < 0.95;

    if (isSuccess) {
      // Prepare booking data
      const payload = {
        ...bookingData,
        guestName,
        guestEmail,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4)
      };

      // Send to backend
      try {
        const response = await fetch('http://localhost:3000/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          modal.classList.add('hidden');
          alert(`✅ התשלום בוצע בהצלחה!\n\nסכום: ₪${bookingData.totalPrice.toLocaleString()}\nאישור הזמנה נשלח לכתובת: ${guestEmail}`);

          // Reset forms
          document.getElementById('search-form').reset();
          document.getElementById('payment-form').reset();
          bookingData = { checkin: '', checkout: '', guests: '2', roomName: '', roomPrice: 0, totalPrice: 0, nights: 0 };
        } else {
          alert('התשלום אושר אך הייתה שגיאה בשמירת ההזמנה במערכת.');
        }
      } catch (error) {
        console.error(error);
        alert('שגיאת תקשורת עם השרת. נא לפנות לתמיכה.');
      }
    } else {
      alert('❌ התשלום נדחה. נא לבדוק את פרטי הכרטיס או ליצור קשר עם הבנק.');
    }

    // Re-enable button
    payButton.disabled = false;
    payButton.innerHTML = originalText;
  });
}

// ---------------------------------------------------------
// Contact Form Logic (Legacy)
// ---------------------------------------------------------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'שולח...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        alert('ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.');
        contactForm.reset();
      } else {
        alert('שגיאה בשליחת ההודעה.');
      }
    } catch (error) {
      alert('שגיאה בתקשורת.');
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
