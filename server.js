// app/server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Static frontend
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Simple in-memory data store (reset on server restart)
const events = [
  { id: 1, title: 'Rock Concert', date: '2025-12-05', price: 500, seats: 100 },
  { id: 2, title: 'Stand-up Comedy', date: '2025-12-12', price: 300, seats: 80 },
  { id: 3, title: 'Classical Night', date: '2025-12-20', price: 600, seats: 60 }
];
const bookings = []; // { id, eventId, name, seatsBooked, totalPrice, timestamp }

// API: list events
app.get('/api/events', (req, res) => {
  res.json(events);
});

// API: list bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// API: create booking
app.post('/api/book', (req, res) => {
  const { eventId, name, seats } = req.body;
  if (!eventId || !name || !seats || seats <= 0) {
    return res.status(400).json({ error: 'Missing or invalid booking data' });
  }

  const evt = events.find(e => e.id === Number(eventId));
  if (!evt) return res.status(404).json({ error: 'Event not found' });

  if (evt.seats < seats) {
    return res.status(400).json({ error: 'Not enough seats available' });
  }

  // Reserve seats
  evt.seats -= seats;
  const booking = {
    id: bookings.length + 1,
    eventId: evt.id,
    eventTitle: evt.title,
    name,
    seatsBooked: seats,
    totalPrice: seats * evt.price,
    timestamp: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// Simple health check
app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
  console.log(`Ticket Booking app listening on http://localhost:${port}`);
});
