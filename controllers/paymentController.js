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

// Helper function to get return flight details for round-trip bookings
const getReturnFlightDetails = async (flight_data) => {
  try {
    // If return flight_id is provided
    if (flight_data.return_flight_id) {
      const flightQuery = `
        SELECT flight_id, aircraft_id 
        FROM flights 
        WHERE flight_id = $1
      `;
      const result = await pool.query(flightQuery, [flight_data.return_flight_id]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    // Find return flight by flight number and route (destination becomes origin for return)
    if (flight_data.return_flight_number && flight_data.destination && flight_data.origin) {
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
        flight_data.return_flight_number,
        flight_data.destination, // Return origin is the original destination
        flight_data.origin       // Return destination is the original origin
      ]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    // Find return flight by departure time and route
    if (flight_data.return_departure_time && flight_data.destination && flight_data.origin) {
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
        flight_data.destination, // Return origin is the original destination
        flight_data.origin,      // Return destination is the original origin
        flight_data.return_departure_time
      ]);
      
      if (result.rows.length > 0) {
        return {
          flight_id: result.rows[0].flight_id,
          aircraft_id: result.rows[0].aircraft_id
        };
      }
    }

    throw new Error('Return flight not found with provided data');
  } catch (error) {
    throw new Error(`Failed to get return flight details: ${error.message}`);
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
    let returnFlightDetails = null;
    
    try {
      flightDetails = await getFlightDetails(flight_data);
      
      // For round-trip flights, also get return flight details
      if (flight_data.trip_type === 'ROUND-WAY') {
        returnFlightDetails = await getReturnFlightDetails(flight_data);
      }
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
      payment_date.toISOString().split('T')[0]+" "+payment_date.toISOString().split('T')[1],
      total_amount,
      'PAID',
      flight_data.trip_type
    ]);
    const db_booking_id = bookingResult.rows[0].booking_id;

    // 2. Create passenger records
     const passengerIds = [];
    for (const p of passengers) {
       const pp = await pool.query(
        `SELECT COUNT(passenger_id) AS cnt 
         FROM passengers 
         WHERE passport_number = $1`,
        [p.passport_number]
      );
      console.log("Cnt ",pp.rows[0].cnt);

      if (parseInt(pp.rows[0].cnt, 10) === 0) {
        // 2a) Insert new passenger
       const passengerResult= await pool.query(
          `INSERT INTO passengers
            (customer_id, first_name, last_name, date_of_birth, passport_number, nationality)
           VALUES ($1, $2, $3, $4, $5, $6) returning passenger_id`,
          [
            p.customer_id,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.passport_number,
            p.nationality,
          ]
        );
         passengerIds.push(passengerResult.rows[0].passenger_id);
      } else {
        // 2b) Update existing passenger (match on passenger_id)
       const passengerResult= await pool.query(
          `UPDATE passengers
             SET customer_id     = $1,
                 first_name      = $2,
                 last_name       = $3,
                 date_of_birth   = $4,
                 passport_number = $5,
                 nationality     = $6
           WHERE passport_number  = $7 returning passenger_id`,
          [
            p.customer_id,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.passport_number,
            p.nationality,
            p.passport_number,   
          ]
        );
         passengerIds.push(passengerResult.rows[0].passenger_id);
      }

    }

    // 3. Create payment record
    const paymentQuery = `
      INSERT INTO payments (booking_id, payment_method, transaction_id, payment_date, status) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING payment_id
    `;
    const paymentResult = await client.query(paymentQuery, [
      db_booking_id,
      payment_method,
      transaction_id,
      payment_date,
      'PAID'
    ]);

    // 4. Generate tickets for each passenger
    const tickets = [];
    
    // Track seat assignments to avoid conflicts in round-trip bookings
    const usedSeats = new Set();
    
    // Helper function to create tickets for a specific flight
    const createTicketsForFlight = async (flightInfo, flightType = 'outbound') => {
      for (let i = 0; i < passengerIds.length; i++) {
        const passenger_id = passengerIds[i];
        
        // Calculate individual ticket price
        const isChild = i >= flight_data.adult_count;
        const ticketPrice = isChild ? flight_data.base_price * 0.75 : flight_data.base_price;
        
        // Find available seat by class, considering existing bookings for this flight
        const requestedClass = flight_data.seat_class || 'Economy';
        
        // Find seats that are not already booked for this specific flight
        // This query finds seats that are either:
        // 1. Not globally booked (is_booked = false), OR
        // 2. Booked globally but not yet assigned to THIS specific flight
        const seatQuery = `
          SELECT s.seat_id, s.seat_number 
          FROM seats s
          WHERE s.aircraft_id = $1 
          AND s.seat_class = $2
          AND s.seat_id NOT IN (
            -- Exclude seats already assigned to tickets for this specific flight
            SELECT DISTINCT t.seat_id 
            FROM ticket t 
            WHERE t.flight_id = $3 AND t.seat_id IS NOT NULL
            UNION
            -- Exclude seats already used in this booking session
            SELECT unnest($4::int[])
          )
          ORDER BY s.seat_number
          LIMIT 1
        `;
        
        const usedSeatsArray = Array.from(usedSeats);
        const seatResult = await client.query(seatQuery, [
          flightInfo.aircraft_id, 
          requestedClass, 
          flightInfo.flight_id,
          usedSeatsArray.length > 0 ? usedSeatsArray : [0] // Use [0] as placeholder when empty
        ]);
        
        if (seatResult.rows.length === 0) {
          throw new Error(`No available ${requestedClass} class seats for ${flightType} flight (${flightInfo.flight_id})`);
        }
        
        const seat_id = seatResult.rows[0].seat_id;
        
        // Track this seat as used in current booking session
        usedSeats.add(seat_id);
        
        // Create ticket (seat assignment is now tracked through the ticket table)
        const ticketQuery = `
          INSERT INTO ticket (booking_id, flight_id, passenger_id, seat_id) 
          VALUES ($1, $2, $3, $4) 
          RETURNING ticket_id
        `;
        const ticketResult = await client.query(ticketQuery, [
          db_booking_id,
          flightInfo.flight_id,
          passenger_id,
          seat_id
        ]);
        
        // Note: We no longer use the global is_booked flag since seats are tracked per flight
        // through the ticket table. This allows the same physical seat to be used on 
        // different flights of the same aircraft.
        
        tickets.push({
          ticket_id: ticketResult.rows[0].ticket_id,
          passenger_id: passenger_id,
          seat_id: seat_id,
          price: ticketPrice,
          flight_type: flightType,
          flight_id: flightInfo.flight_id
        });
      }
    };

    // Create tickets for outbound flight
    await createTicketsForFlight(flightDetails, 'outbound');
    
    // Create tickets for return flight if it's a round-trip
    if (flight_data.trip_type === 'ROUND-WAY' && returnFlightDetails) {
      await createTicketsForFlight(returnFlightDetails, 'return');
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
