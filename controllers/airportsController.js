const pool = require('../config/database');

const getAllAirports = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM airports ORDER BY airport_id');
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airports',
      error: error.message
    });
  }
};

const getAirportById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airport ID'
      });
    }
    
    const result = await pool.query('SELECT * FROM airports WHERE airport_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airport not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airport',
      error: error.message
    });
  }
};

const searchAirports = async (req, res) => {
  try {
    const { city, country, iata_code } = req.query;
    
    let query = 'SELECT * FROM airports WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (city) {
      paramCount++;
      query += ` AND LOWER(city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
    }
    
    if (country) {
      paramCount++;
      query += ` AND LOWER(country) LIKE LOWER($${paramCount})`;
      params.push(`%${country}%`);
    }
    
    if (iata_code) {
      paramCount++;
      query += ` AND UPPER(iata_code) = UPPER($${paramCount})`;
      params.push(iata_code);
    }
    
    query += ' ORDER BY airport_name';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search airports',
      error: error.message
    });
  }
};

const searchAirportsbyname = async (req,res) =>{
  const { query,iata_code } = req.query;
  // console.log(query);
  if(!query) return res.json([]);
  try{
    
    const result = await pool.query(`
      SELECT airport_name,iata_code,city,country
      FROM airports
      WHERE
        (airport_name ILIKE $1 OR
        iata_code ILIKE $1 OR
        city ILIKE $1 OR
        country ILIKE $1) AND
        iata_code != $2
    `,[`%${query}%`,iata_code]);
      // console.log(result.rows);
      res.json(result.rows);

      

  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search airports',
      error: error.message
    });

  }
};

const createAirport = async (req, res) => {
  try {
    const { airport_name, iata_code, city, country } = req.body;
    
    // Validation
    if (!airport_name) {
      return res.status(400).json({
        success: false,
        message: 'Airport name is required'
      });
    }
    
    if (!iata_code) {
      return res.status(400).json({
        success: false,
        message: 'IATA code is required'
      });
    }
    
    if (iata_code.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'IATA code must be exactly 3 characters'
      });
    }
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }
    
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required'
      });
    }
    
    // Check if IATA code already exists
    const existingAirport = await pool.query(
      'SELECT airport_id FROM airports WHERE UPPER(iata_code) = UPPER($1)',
      [iata_code]
    );
    
    if (existingAirport.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Airport with this IATA code already exists'
      });
    }
    
    
    const result = await pool.query(`
      INSERT INTO airports(airport_id, airport_name, iata_code, city, country) 
      VALUES ($1, UPPER($2), $3, $4) RETURNING *
    `, [airport_name, iata_code, city, country]);
    
    res.status(201).json({
      success: true,
      message: 'Airport created successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create airport',
      error: error.message
    });
  }
};

const updateAirport = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { airport_name, iata_code, city, country } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airport ID'
      });
    }
    
    // Validation
    if (!airport_name) {
      return res.status(400).json({
        success: false,
        message: 'Airport name is required'
      });
    }
    
    if (!iata_code) {
      return res.status(400).json({
        success: false,
        message: 'IATA code is required'
      });
    }
    
    if (iata_code.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'IATA code must be exactly 3 characters'
      });
    }
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }
    
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required'
      });
    }
    
    // Check if IATA code exists for different airport
    const existingAirport = await pool.query(
      'SELECT airport_id FROM airports WHERE UPPER(iata_code) = UPPER($1) AND airport_id != $2',
      [iata_code, id]
    );
    
    if (existingAirport.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another airport with this IATA code already exists'
      });
    }

    const result = await pool.query(`
      UPDATE airports
      SET airport_name = $1, iata_code = UPPER($2), city = $3, country = $4
      WHERE airport_id = $5
      RETURNING *
    `, [airport_name, iata_code, city, country, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airport not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Airport updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update airport',
      error: error.message
    });
  }
};

const deleteAirport = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airport ID'
      });
    }
    
    const result = await pool.query(`
      DELETE FROM airports 
      WHERE airport_id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airport not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Airport deleted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete airport',
      error: error.message
    });
  }
};

module.exports = {
  getAllAirports,
  getAirportById,
  searchAirports,
  createAirport,
  updateAirport,
  deleteAirport,
  searchAirportsbyname
};