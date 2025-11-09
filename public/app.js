// app/public/app.js
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function loadEvents() {
  const events = await fetchJSON('/api/events');
  const eventsDiv = document.getElementById('events');
  const select = document.getElementById('event-select');
  eventsDiv.innerHTML = '';
  select.innerHTML = '';
  events.forEach(e => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `<div><strong>${e.title}</strong><div>${e.date}</div></div>
                     <div>₹${e.price} • Seats left: ${e.seats}</div>`;
    eventsDiv.appendChild(div);

    const option = document.createElement('option');
    option.value = e.id;
    option.textContent = `${e.title} (${e.date}) — ₹${e.price} — ${e.seats} left`;
    select.appendChild(option);
  });
}

async function loadBookings() {
  const bookings = await fetchJSON('/api/bookings');
  const bdiv = document.getElementById('bookings');
  bdiv.innerHTML = '';
  if (bookings.length === 0) {
    bdiv.textContent = 'No bookings yet.';
    return;
  }
  bookings.slice().reverse().forEach(b => {
    const el = document.createElement('div');
    el.className = 'booking';
    el.innerHTML = `<div>
                      <strong>${b.eventTitle}</strong>
                      <div>By: ${b.name}</div>
                      <div>Seats: ${b.seatsBooked} • ₹${b.totalPrice}</div>
                    </div>
                    <div>${new Date(b.timestamp).toLocaleString()}</div>`;
    bdiv.appendChild(el);
  });
}

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const eventId = document.getElementById('event-select').value;
  const seats = Number(document.getElementById('seats').value);
  const msg = document.getElementById('booking-msg');
  msg.textContent = '';
  try {
    const booking = await fetchJSON('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, eventId, seats })
    });
    msg.style.color = 'green';
    msg.textContent = `Booking successful! ID: ${booking.id} • ₹${booking.totalPrice}`;
    // reload UI
    await loadEvents();
    await loadBookings();
    // reset
    document.getElementById('seats').value = '1';
  } catch (err) {
    msg.style.color = 'crimson';
    msg.textContent = err.message;
  }
});

(async function init() {
  try {
    await loadEvents();
    await loadBookings();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="color:crimson; padding:20px;">Failed to load app: ${err.message}</div>`;
  }
})();