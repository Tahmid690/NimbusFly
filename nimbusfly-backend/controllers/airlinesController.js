const pool = require('../config/database');


const getAllAirlines = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM airlines ORDER BY airline_id');
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airlines',
      error: error.message
    });
  }
};

const getAirlineById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }
    
    const result = await pool.query('SELECT * FROM airlines WHERE airline_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch airline',
      error: error.message
    });
  }
};

const createAirline = async (req, res) => {
  try {
    const { airline_name, logo_url } = req.body;
    
    // Validation
    if (!airline_name) {
      return res.status(400).json({
        success: false,
        message: 'Airline name is required'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO airlines(airline_name, logo_url) VALUES ($1, $2) RETURNING *
    `, [airline_name, logo_url]);
    
    res.status(201).json({
      success: true,
      message: 'Airline created successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create airline',
      error: error.message
    });
  }
};

const updateAirline = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { airline_name, logo_url } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }
    
    if (!airline_name) {
      return res.status(400).json({
        success: false,
        message: 'Airline name is required'
      });
    }

    const result = await pool.query(`
      UPDATE airlines
      SET airline_name = $1, logo_url = $2
      WHERE airline_id = $3
      RETURNING *
    `, [airline_name, logo_url, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Airline updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update airline',
      error: error.message
    });
  }
};

const deleteAirline = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validation
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }
    
    const result = await pool.query(`
      DELETE FROM airlines 
      WHERE airline_id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Airline deleted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete airline',
      error: error.message
    });
  }
};

module.exports = {
  getAllAirlines,
  getAirlineById,
  createAirline,
  updateAirline,
  deleteAirline
};