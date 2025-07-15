const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const JWT_SECRET = 'bugi_na_bai_bugi_na'; // In production, use environment variable

const register = async (req,res)=>{
        try{

            const {email,password,airline_id,airline_name}=req.body;
            if(!email||!password||!airline_id||!airline_name){
                return res.status(400).json({
                status : "failed",
                 log : "All fields must be filled"
                });
            }
           
        const result1=await pool.query(`
            select * from airline_admin
            where airline_id=$1
            `,[airline_id]);


        if(result1.rowCount>0){
            return res.status(400).json({
                 status : "failed",
                 log : "Airline already exists"
            });
        }

        const result2=await pool.query(`
            select * from airline_admin
            where email=$1 
            `,[email]);

        if(result2.rowCount>0){
            return res.status(400).json({
                 status : "failed",
                 log : "Airline already exists with same email"
            });
        }
        
    const hashed_password=await bcrypt.hash(password,10);
    const result3=await pool.query(`
        insert into airline_admin
        (email,password,airline_id,airline_name) 
        values ($1,$2,$3,$4)
        returning *
        `,[email,hashed_password,airline_id,airline_name]) ;

        res.status(201).json({
             status : "success",
             log : "Airline registered",
             admin: result3.rows[0]
        })
 
        }catch(error){
            res.status(500).json({
                success:false,
                message:'An unwanted problem occured',
                error:error.message
            })
        }
 } ;


const login=async(req,res)=>{
    try{

      const {email,password}=req.body;
      if(!email||!password){
        return res.status(400).json({
            status:'failed',
            log:"All the fields must be filled"
        });
      }

      const result=await pool.query(`
        select * from airline_admin
        where email=$1
        `,[email]);

      if(result.rowCount==0){
        return res.status(400).json({
            status:'failed',
            log:'The email you entered is not correct'
        });
      }
    if(! (await bcrypt.compare(password,result.rows[0].password))){
         return res.status(400).json({
            status:'failed',
            log:'The password you entered is not correct'
        });
    }
    const token= jwt.sign({
        admin_id:result.rows[0].admin_id,
        email:email,
        airline_id:result.rows[0].airline_id
     },JWT_SECRET,{expiresIn:'24h'});


      return res.json({
                "status": "success",  // Fixed this!
                "log": "login successful",
                "jwt_token": token,
                "user": {
                    admin_id: result.rows[0].admin_id,
                    airline_id: result.rows[0].airline_id,
                    airline_name:result.rows[0].airline_name,
                    email: email
                }
            });

    }catch(error){
         res.status(500).json({
                success:false,
                message:'An unwanted problem occured',
                error:error.message
            })
    }
} ;


const getAdminById = async (req, res) => {
  console.log("zzjhdgc");
  try {
    const id = parseInt(req.params.id);
     
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }

    const result = await pool.query(`
      SELECT admin_id, email, airline_id, airline_name
      FROM airline_admin
      WHERE admin_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({ success: true, admin: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin', error: error.message });
  }
};


const updateAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { email, password, airline_name } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const currentAdmin = await pool.query('SELECT * FROM airline_admin WHERE admin_id = $1', [id]);

    if (currentAdmin.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const updated = await pool.query(`
      UPDATE airline_admin
      SET 
        email = COALESCE($1, email),
        password = COALESCE($2, password),
        airline_name = COALESCE($3, airline_name)
      WHERE admin_id = $4
      RETURNING admin_id, email, airline_id, airline_name
    `, [
      email || null,
      hashedPassword,
      airline_name || null,
      id
    ]);

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: updated.rows[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update admin', error: error.message });
  }
};

 
const deleteAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }

    const result = await pool.query(`
      DELETE FROM airline_admin
      WHERE admin_id = $1
      RETURNING *
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully',
      deleted: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};

// Get all bookings for a specific airline
const getAirlineBookings = async (req, res) => {
  try {
    const airline_id = parseInt(req.params.airline_id);
    
    if (isNaN(airline_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }

    const result = await pool.query(`
      SELECT 
        bk.*,
        (cus.first_name || ' ' || cus.last_name) AS customer_name,
        cus.email as customer_email,
        cus.phone_number as customer_phone,
        COUNT(t.ticket_id) as total_passengers,
        STRING_AGG(DISTINCT f.flight_number, ', ') as flight_numbers,
        STRING_AGG(DISTINCT (origin_airport.iata_code || '-' || dest_airport.iata_code), ', ') as routes,
        MIN(f.departure_time) as earliest_departure,
        MAX(f.arrival_time) as latest_arrival,
        STRING_AGG(DISTINCT al.airline_name, ', ') as airlines
      FROM bookings bk
      JOIN customer cus ON bk.customer_id = cus.customer_id
      JOIN ticket t ON bk.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE al.airline_id = $1
      GROUP BY bk.booking_id, cus.first_name, cus.last_name, cus.email, cus.phone_number
      ORDER BY bk.booking_date DESC
    `, [airline_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Could not fetch bookings for airline',
      error: error.message
    });
  }
};

// Get all flights for a specific airline
const getAirlineFlights = async (req, res) => {
  try {
    const airline_id = parseInt(req.params.airline_id);
    
    if (isNaN(airline_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }
    console.log("Fetching flights for airline ID:", airline_id);
    const result = await pool.query(`
      SELECT 
        f.*,
        origin_airport.iata_code as origin_code,
        origin_airport.airport_name as origin_airport,
        dest_airport.iata_code as destination_code,
        dest_airport.airport_name as destination_airport,
        al.airline_name,
        ac.model as aircraft_model,
        ac.total_seats as aircraft_capacity,
        INITCAP((CASE
          WHEN f.status = FALSE THEN 'cancelled'
          WHEN f.arrival_time < NOW() THEN 'completed'
          WHEN f.departure_time > NOW() THEN 'scheduled'
          ELSE 'completed'
          END
    )) as flight_status,
        f.status
      FROM flights f
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE al.airline_id = $1
      ORDER BY f.departure_time DESC
    `, [airline_id]);
      console.log(result.rows);
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Could not fetch flights for airline',
      error: error.message
    });
  }
};

// Get dashboard analytics for a specific airline
const getDashboardAnalytics = async (req, res) => {
  try {
    const airline_id = parseInt(req.params.airline_id);
    
    if (isNaN(airline_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }

    
    const totBook = await pool.query(`
      SELECT COUNT(DISTINCT bk.booking_id) as total_bookings
      FROM bookings bk
      JOIN ticket t ON bk.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE al.airline_id = $1
    `, [airline_id]);


    const totRev = await pool.query(`
      SELECT sum(price) as total_revenue
      FROM (
        SELECT distinct bk.booking_id,bk.total_amount as price
        FROM bookings bk
        JOIN ticket t ON bk.booking_id = t.booking_id
        JOIN flights f ON t.flight_id = f.flight_id
        JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
        JOIN airlines al ON ac.airline_id = al.airline_id
        WHERE al.airline_id = $1
        )
    `, [airline_id]);

    const totfli = await pool.query(`
      SELECT COUNT(DISTINCT f.flight_id) as total_flights
      FROM airlines al
      JOIN aircraft ac ON al.airline_id = ac.airline_id
      JOIN flights f ON ac.aircraft_id = f.aircraft_id
      WHERE al.airline_id = $1
    `, [airline_id]);

    const totpas = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as total_passengers
      FROM airlines al
      JOIN aircraft ac ON al.airline_id = ac.airline_id
      JOIN flights f ON ac.aircraft_id = f.aircraft_id
      JOIN ticket t ON f.flight_id = t.flight_id
      JOIN bookings bk ON t.booking_id = bk.booking_id
      WHERE al.airline_id = $1
    `, [airline_id]);

    
    

    // Get recent bookings
    const recentBookingsQuery = await pool.query(`
      SELECT 
        bk.booking_id,
        (cus.first_name || ' ' || cus.last_name) AS customer_name,
        bk.total_amount,
        bk.payment_status,
        bk.booking_date,
        STRING_AGG(DISTINCT (origin_airport.iata_code || '-' || dest_airport.iata_code), ', ') as routes
      FROM bookings bk
      JOIN customer cus ON bk.customer_id = cus.customer_id
      JOIN ticket t ON bk.booking_id = t.booking_id
      JOIN flights f ON t.flight_id = f.flight_id
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE al.airline_id = $1
      GROUP BY bk.booking_id, cus.first_name, cus.last_name, bk.total_amount, bk.payment_status, bk.booking_date
      ORDER BY bk.booking_date DESC
      LIMIT 5
    `, [airline_id]);

    // Get upcoming flights
    const upcomingFlightsQuery = await pool.query(`
      SELECT 
        f.flight_number,
        f.departure_time,
        f.arrival_time,
        origin_airport.iata_code as origin_code,
        dest_airport.iata_code as destination_code,
        ac.total_seats as total_capacity
      FROM flights f
      JOIN airports origin_airport ON f.origin_airport_id = origin_airport.airport_id
      JOIN airports dest_airport ON f.destination_airport_id = dest_airport.airport_id
      JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
      JOIN airlines al ON ac.airline_id = al.airline_id
      JOIN ticket t ON f.flight_id = t.flight_id
      WHERE al.airline_id = $1 AND f.departure_time > NOW()
      GROUP BY f.flight_id, f.flight_number, f.departure_time, f.arrival_time, origin_airport.iata_code, dest_airport.iata_code, ac.total_seats
      ORDER BY f.departure_time ASC
      LIMIT 5
    `, [airline_id]);

    

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings: parseInt(totBook.rows[0].total_bookings) || 0,
          totalRevenue: parseFloat(totRev.rows[0].total_revenue) || 0,
          totalFlights: parseInt(totfli.rows[0].total_flights) || 0,
          totalPassengers: parseInt(totpas.rows[0].total_passengers) || 0,
        },
        recentBookings: recentBookingsQuery.rows,
        upcomingFlights: upcomingFlightsQuery.rows
      }
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Could not fetch analytics for airline',
      error: error.message
    });
  }
};

module.exports={
    register,
    login,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    getAirlineBookings,
    getAirlineFlights,
    getDashboardAnalytics
}