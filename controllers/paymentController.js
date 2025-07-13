const pool = require('../config/database');

// Helper function to extract flight_id and aircraft_id from flight data
const getFlightDetails = async (flight_data) => {
  try {
    // If flight_id is already provided, get aircraft_id from it
    if (flight_data.flight_id) {
      const flightQuery = `
        SELECT flight_id, aircraft_id 
        FROM flights 
        WHERE flight_id = $1
      `;
      const result = await pool.query(flightQuery, [flight_data.flight_id]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    // If no flight_id, try to find flight by flight_number and route
    if (flight_data.flight_number && flight_data.origin && flight_data.destination) {
      const flightQuery = `
        SELECT f.flight_id, f.aircraft_id 
        FROM flights f
        JOIN airports orig ON f.origin_airport_id = orig.airport_id
        JOIN airports dest ON f.destination_airport_id = dest.airport_id
        WHERE f.flight_number = $1 
        AND orig.iata_code = $2 
        AND dest.iata_code = $3
        LIMIT 1
      `;
      const result = await pool.query(flightQuery, [
        flight_data.flight_number,
        flight_data.origin,
        flight_data.destination
      ]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    // If still no match, try to find by departure time and route
    if (flight_data.departure_time && flight_data.origin && flight_data.destination) {
      const flightQuery = `
        SELECT f.flight_id, f.aircraft_id 
        FROM flights f
        JOIN airports orig ON f.origin_airport_id = orig.airport_id
        JOIN airports dest ON f.destination_airport_id = dest.airport_id
        WHERE orig.iata_code = $1 
        AND dest.iata_code = $2
        AND DATE(f.departure_time) = DATE($3)
        LIMIT 1
      `;
      const result = await pool.query(flightQuery, [
        flight_data.origin,
        flight_data.destination,
        flight_data.departure_time
      ]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    throw new Error('Flight not found with provided data');
  } catch (error) {
    throw new Error(`Failed to get flight details: ${error.message}`);
  }
};

const getPaymentByBooking = async (req, res) => {
  try {
    const booking_id = parseInt(req.params.booking_id);
    if (isNaN(booking_id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const result = await pool.query(`
      SELECT * FROM payments
      WHERE booking_id = $1
    `, [booking_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No payment found for this booking' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: error.message
    });
  }
};

const processPayment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      customer_id, 
      passengers, 
      flight_data, 
      payment_method, 
      billing_address, 
      total_amount 
    } = req.body;

    // Validation
    if (!customer_id) return res.status(400).json({ success: false, message: 'Customer ID is required' });
    if (!passengers || passengers.length === 0) return res.status(400).json({ success: false, message: 'Passenger data is required' });
    if (!flight_data) return res.status(400).json({ success: false, message: 'Flight data is required' });
    if (!flight_data.base_price) return res.status(400).json({ success: false, message: 'Base price is required' });
    if (flight_data.adult_count === undefined || flight_data.adult_count === null) return res.status(400).json({ success: false, message: 'Adult count is required' });
    if (!payment_method) return res.status(400).json({ success: false, message: 'Payment method is required' });
    if (!total_amount) return res.status(400).json({ success: false, message: 'Total amount is required' });

    // Extract flight_id and aircraft_id from flight data
    let flightDetails;
    try {
      flightDetails = await getFlightDetails(flight_data);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: `Flight lookup failed: ${error.message}` 
      });
    }

    // Generate booking ID and transaction ID
    const booking_id = `NF${Date.now().toString().slice(-6)}`;
    const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const payment_date = new Date();

    // Start database transaction
    await client.query('BEGIN');

    // 1. Create booking record
    const bookingQuery = `
      INSERT INTO bookings (customer_id, booking_date, total_amount, payment_status, trip_type) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING booking_id
    `;
    const bookingResult = await client.query(bookingQuery, [
      customer_id,
      payment_date.toISOString().split('T')[0],
      total_amount,
      'PAID',
      flight_data.trip_type
    ]);
    const db_booking_id = bookingResult.rows[0].booking_id;

    // 2. Create passenger records
    const passengerIds = [];
    for (const passenger of passengers) {
      const passengerQuery = `
        INSERT INTO passengers (customer_id, first_name, last_name, date_of_birth, passport_number, nationality, title) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING passenger_id
      `;
      const passengerResult = await client.query(passengerQuery, [
        customer_id,
        passenger.first_name,
        passenger.last_name,
        passenger.date_of_birth,
        passenger.passport_number,
        passenger.nationality,
        passenger.title || 'Mr'
      ]);
      passengerIds.push(passengerResult.rows[0].passenger_id);
    }

    // 3. Create payment record
    const paymentQuery = `
      INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_date, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING payment_id
    `;
    const paymentResult = await client.query(paymentQuery, [
      db_booking_id,
      total_amount,
      payment_method,
      transaction_id,
      payment_date,
      'PAID'
    ]);

    // 4. Generate tickets for each passenger
    const tickets = [];
    for (let i = 0; i < passengerIds.length; i++) {
      const passenger_id = passengerIds[i];
      
      // Calculate individual ticket price
      const isChild = i >= flight_data.adult_count;
      const ticketPrice = isChild ? flight_data.base_price * 0.75 : flight_data.base_price;
      
      // Find available seat by class (Economy or Business)
      const requestedClass = flight_data.seat_class || 'Economy';
      const seatQuery = `
        SELECT seat_id, seat_number FROM seats 
        WHERE aircraft_id = $1 AND is_booked = false 
        AND (seat_class = $2)
        ORDER BY seat_number
        LIMIT 1
      `;
      const seatResult = await client.query(seatQuery, [flightDetails.aircraft_id, requestedClass]);
      
      if (seatResult.rows.length === 0) {
        throw new Error(`No available ${requestedClass} class seats`);
      }
      
      const seat_id = seatResult.rows[0].seat_id;
      
      // Create ticket
      const ticketQuery = `
        INSERT INTO ticket (booking_id, flight_id, passenger_id, seat_id, price) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING ticket_id
      `;
      const ticketResult = await client.query(ticketQuery, [
        db_booking_id,
        flightDetails.flight_id,
        passenger_id,
        seat_id,
        ticketPrice
      ]);
      
      // Mark seat as booked
      await client.query('UPDATE seats SET is_booked = true WHERE seat_id = $1', [seat_id]);
      
      tickets.push({
        ticket_id: ticketResult.rows[0].ticket_id,
        passenger_id: passenger_id,
        seat_id: seat_id,
        price: ticketPrice
      });
    }

    // Commit transaction
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully and all records created',
      booking_id: booking_id,
      db_booking_id: db_booking_id,
      transaction_id: transaction_id,
      amount: total_amount,
      status: 'PAID',
      payment_id: paymentResult.rows[0].payment_id,
      passenger_ids: passengerIds,
      tickets: tickets,
      data: {
        booking_id: booking_id,
        transaction_id: transaction_id,
        payment_date: payment_date,
        total_amount: total_amount,
        passengers_created: passengerIds.length,
        tickets_created: tickets.length
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.log('Pgaolll')
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment',
      error: error.message
    });

  } finally {
    client.release();
  }
};

// ✅ 3. PUT /payments/:id/status
const updatePaymentStatus = async (req, res) => {
  try {
    const payment_id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(payment_id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }

    const result = await pool.query(`
      UPDATE payments
      SET status = $1
      WHERE payment_id = $2
      RETURNING *
    `, [status, payment_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentByBooking,
  processPayment,
  updatePaymentStatus
};
