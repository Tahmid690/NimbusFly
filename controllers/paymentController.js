const pool = require('../config/database');



const getPaymentByBooking = async (req, res) => {

  try {
    const booking_id = parseInt(req.params.booking_id);
    if (isNaN(booking_id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid booking ID' 
      });
    }

    const result = await pool.query(`
      SELECT * FROM payments WHERE booking_id = $1
    `, [booking_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No payment found for this booking' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });

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
  // console.log("Processing payment with data:", req.body);
  
  try {
    const { 
      customer_id, 
      passengers, 
      flight_data, 
      payment_method, 
      total_amount 
    } = req.body;

    // =============================================================================
    // STEP 1: BASIC VALIDATION
    // =============================================================================
    
    if (!customer_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer ID is required' 
      });
    }

    if (!passengers || passengers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one passenger is required' 
      });
    }

    if (!flight_data || !flight_data.flight_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Flight number is required' 
      });
    }

    if (!payment_method || !total_amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method and total amount are required' 
      });
    }

    // =============================================================================
    // STEP 2: GET FLIGHT DETAILS BY FLIGHT NUMBER
    // =============================================================================
    
    const getFlightByNumber = async (flightNumber) => {
      const query = `
        SELECT flight_id, aircraft_id, available_seats, 
               available_econ_seats, available_busi_seats
        FROM flights 
        WHERE flight_number = $1 AND status = TRUE
      `;
      const result = await client.query(query, [flightNumber]);
      
      if (result.rows.length === 0) {
        throw new Error(`Flight ${flightNumber} not found`);
      }
      
      return result.rows[0];
    };

    // Get outbound flight
    const outboundFlight = await getFlightByNumber(flight_data.flight_number);
    
    // Get return flight if round-trip
    let returnFlight = null;
    if (flight_data.trip_type === 'ROUND-WAY' && flight_data.return_flight_number) {
      returnFlight = await getFlightByNumber(flight_data.return_flight_number);
    }

    // =============================================================================
    // STEP 3: CHECK SEAT AVAILABILITY
    // =============================================================================
    
    const requiredSeats = flight_data.adult_count + flight_data.child_count;
    const seatClass = flight_data.seat_class || 'Economy';
    
    const checkSeats = (flightInfo, flightName) => {
      const availableSeats = seatClass === 'Business' ? 
        flightInfo.available_busi_seats : 
        flightInfo.available_econ_seats;
      
      if (availableSeats < requiredSeats) {
        throw new Error(`Not enough ${seatClass} seats available on ${flightName}. Required: ${requiredSeats}, Available: ${availableSeats}`);
      }
    };

    checkSeats(outboundFlight, flight_data.flight_number);
    if (returnFlight) {
      checkSeats(returnFlight, flight_data.return_flight_number);
    }

    // =============================================================================
    // STEP 4: START TRANSACTION AND CREATE RECORDS
    // =============================================================================
    
    await client.query('BEGIN');

    // Generate IDs
    const transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create booking
    const bookingQuery = `
      INSERT INTO bookings (customer_id, booking_date, total_amount, payment_status, trip_type) 
      VALUES ($1, NOW(), $2, 'PAID', $3) 
      RETURNING booking_id
    `;
    
    const bookingResult = await client.query(bookingQuery, [
      customer_id,
      total_amount,
      flight_data.trip_type
    ]);
    
    const db_booking_id = bookingResult.rows[0].booking_id;

    // =============================================================================
    // STEP 5: PROCESS PASSENGERS
    // =============================================================================
    
    const passengerIds = [];
    const passengerInfo = [];
    
    for (const passenger of passengers) {
      if (!passenger.passport_number || !passenger.first_name || !passenger.last_name) {
        throw new Error('All passengers must have passport number, first name, and last name');
      }

      // Check if passenger exists
      const existingQuery = `SELECT passenger_id FROM passengers WHERE passport_number = $1`;
      const existingResult = await client.query(existingQuery, [passenger.passport_number]);
      
      let passengerId;
      let passengerin;
      
      if (existingResult.rows.length === 0) {
        // Create new passenger
        const insertQuery = `
          INSERT INTO passengers (customer_id, first_name, last_name, date_of_birth, passport_number, nationality, title)
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING passenger_id
        `;
        
        const passengerResult = await client.query(insertQuery, [
          customer_id,
          passenger.first_name,
          passenger.last_name,
          passenger.date_of_birth,
          passenger.passport_number,
          passenger.nationality,
          passenger.title || null
        ]);
        
        passengerId = passengerResult.rows[0].passenger_id;
      } else {
        // Update existing passenger
        const updateQuery = `
          UPDATE passengers 
          SET first_name = $1, last_name = $2, date_of_birth = $3, nationality = $4, title = $5
          WHERE passport_number = $6 
          RETURNING passenger_id
        `;
        
        const passengerResult = await client.query(updateQuery, [
          passenger.first_name,
          passenger.last_name,
          passenger.date_of_birth,
          passenger.nationality,
          passenger.title || null,
          passenger.passport_number
        ]);
        
        passengerId = passengerResult.rows[0].passenger_id;
        passengerin = passengerResult.rows[0];
      }
      
      passengerIds.push(passengerId);
    }

    // =============================================================================
    // STEP 6: CREATE PAYMENT RECORD
    // =============================================================================
    
    const paymentQuery = `
      INSERT INTO payments (booking_id, payment_method, transaction_id, payment_date, status) 
      VALUES ($1, $2, $3, NOW(), 'PAID') 
      RETURNING payment_id
    `;
    
    const paymentResult = await client.query(paymentQuery, [
      db_booking_id,
      payment_method,
      transaction_id
    ]);

    // =============================================================================
    // STEP 7: ASSIGN SEATS AND CREATE TICKETS
    // =============================================================================
    
    const createTicketsForFlight = async (flightInfo, flightNumber) => {
      const tickets = [];
      
      // Get available seats for this flight
      const seatQuery = `
        SELECT seat_id, seat_number 
        FROM seats 
        WHERE flight_id = $1 AND seat_class = $2 AND is_booked = FALSE
        ORDER BY seat_number
        LIMIT $3
      `;
      
      const seatResult = await client.query(seatQuery, [
        flightInfo.flight_id,
        seatClass,
        requiredSeats
      ]);
      
      if (seatResult.rows.length < requiredSeats) {
        throw new Error(`Could not find enough seats for flight ${flightNumber}`);
      }

      // Create tickets for each passenger
      for (let i = 0; i < passengerIds.length; i++) {
        const seat = seatResult.rows[i];

        
        const ticketQuery = `
          INSERT INTO ticket (booking_id, flight_id, passenger_id, seat_id) 
          VALUES ($1, $2, $3, $4) 
          RETURNING ticket_id
        `;
        
        const ticketResult = await client.query(ticketQuery, [
          db_booking_id,
          flightInfo.flight_id,
          passengerIds[i],
          seat.seat_id
        ]);
        tickets.push({
          ticket_id: ticketResult.rows[0].ticket_id,
          passenger_id: passengerIds[i],
          seat_id: seat.seat_id,
          seat_number: seat.seat_number,
          flight_id: flightInfo.flight_id
        });
      }
      
      return tickets;
    };

    // Create tickets for outbound flight
    const outboundTickets = await createTicketsForFlight(outboundFlight, flight_data.flight_number);
    let allTickets = [...outboundTickets];
    console.log("Outbound tickets created:", allTickets);

    // Create tickets for return flight if round-trip
    if (returnFlight) {
      const returnTickets = await createTicketsForFlight(returnFlight, flight_data.return_flight_number);
      allTickets.push(...returnTickets);
    }

    // =============================================================================
    // STEP 8: COMMIT TRANSACTION AND RESPOND
    // =============================================================================
    
    await client.query('COMMIT');

    // Success response
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        booking_id: db_booking_id,
        transaction_id: transaction_id,
        payment_id: paymentResult.rows[0].payment_id,
        total_amount: total_amount,
        passengers_processed: passengerIds.length,
        tickets_created: allTickets.length,
        tickets: allTickets,
        passengerInfo : passengerInfo,
        flights: {
          outbound: {
            flight_number: flight_data.flight_number,
            flight_id: outboundFlight.flight_id
          },
          return: returnFlight ? {
            flight_number: flight_data.return_flight_number,
            flight_id: returnFlight.flight_id
          } : null
        }
      }
    });

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    
    console.error('Payment processing error:', error);
    
    let statusCode = 500;
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('required') || error.message.includes('enough')) statusCode = 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Payment processing failed',
      timestamp: new Date().toISOString()
    });

  } finally {
    client.release();
  }
};
// 3. PUT /payments/:id/status
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
