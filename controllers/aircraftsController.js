const pool = require('../config/database');

const getAllAircraft = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ac.*,
        al.airline_name
      FROM aircraft ac
      LEFT JOIN airlines al ON ac.airline_id = al.airline_id
      ORDER BY ac.aircraft_id
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aircraft',
      error: error.message
    });
  }
};

const getAircraftById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid aircraft ID'
      });
    }
    
    const result = await pool.query(`
      SELECT 
        ac.*,
        al.airline_name
      FROM aircraft ac
      LEFT JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE ac.aircraft_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aircraft not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aircraft',
      error: error.message
    });
  }
};

const getAircraftByIdfly = async (req, res) => {
  try {
    const id = parseInt(req.params.airline_id);
    // console.log('Fetching aircraft by ID:', id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid aircraft ID'
      });
    }
    
    const result = await pool.query(`
      SELECT 
        ac.*,
        al.airline_name
      FROM aircraft ac
      JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE ac.airline_id = $1 and ac.status = 'Active'
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aircraft not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aircraft',
      error: error.message
    });
  }
};

const getAircraftByAirline = async (req, res) => {
  try {
    const airlineId = parseInt(req.params.airline_id);
    
    if (isNaN(airlineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid airline ID'
      });
    }
    
    const result = await pool.query(`
      SELECT 
        ac.*,
        al.airline_name
      FROM aircraft ac
      LEFT JOIN airlines al ON ac.airline_id = al.airline_id
      WHERE ac.airline_id = $1
      ORDER BY ac.aircraft_id
    `, [airlineId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aircraft for airline',
      error: error.message
    });
  }
};

const createAircraft = async (req, res) => {
  try {
    const { 
      model, 
      total_seats, 
      econ_seats, 
      busi_seats, 
      airline_id,
      registration_number,
      manufacturer,
      year_manufactured,
      max_range_km,
      status 
    } = req.body;
    
    // Validation for required fields
    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Aircraft model is required'
      });
    }
    

    
  
    
    if (!airline_id) {
      return res.status(400).json({
        success: false,
        message: 'Airline ID is required'
      });
    }
    

    
    // Validate optional fields
    if (year_manufactured && (year_manufactured < 1950 || year_manufactured > new Date().getFullYear() + 5)) {
      return res.status(400).json({
        success: false,
        message: 'Year manufactured must be between 1950 and ' + (new Date().getFullYear() + 5)
      });
    }
    
    if (max_range_km && max_range_km < 0) {
      return res.status(400).json({
        success: false,
        message: 'Max range must be a non-negative number'
      });
    }

    if (total_seats <= 0 || econ_seats < 0 || busi_seats < 0 || (econ_seats + busi_seats > total_seats)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seat configuration'
      });
    }

    
    // Check if airline exists
    const airlineExists = await pool.query(
      'SELECT airline_id FROM airlines WHERE airline_id = $1',
      [airline_id]
    );
    
    if (airlineExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }
    
    // Insert aircraft with all fields
    const result = await pool.query(`
      INSERT INTO aircraft(
        model, 
        total_seats, 
        econ_seats, 
        busi_seats, 
        airline_id,
        registration_number,
        manufacturer,
        year_manufactured,
        max_range_km,
        status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `, [
      model, 
      total_seats, 
      econ_seats, 
      busi_seats, 
      airline_id,
      registration_number || null,
      manufacturer || null,
      year_manufactured || null,
      max_range_km || null,
      status || 'Active'
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Aircraft created successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    } else if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        message: 'Aircraft with this registration number already exists'
      });
    } else {
      console.log('Error creating aircraft:', error.message)
      res.status(500).json({
        success: false,
        message: 'Failed to create aircraft',
        error: error.message
        
      });
    }
  }
};

const updateAircraft = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      model, 
      total_seats, 
      econ_seats, 
      busi_seats, 
      airline_id,
      registration_number,
      manufacturer,
      year_manufactured,
      max_range_km,
      status 
    } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid aircraft ID'
      });
    }
    
    // Validation for required fields
    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Aircraft model is required'
      });
    }
    
    if (!airline_id) {
      return res.status(400).json({
        success: false,
        message: 'Airline ID is required'
      });
    }
  
    
  
    
    if (max_range_km && max_range_km < 0) {
      return res.status(400).json({
        success: false,
        message: 'Max range must be a non-negative number'
      });
    }
     if (total_seats <= 0 || econ_seats < 0 || busi_seats < 0 || (econ_seats + busi_seats > total_seats)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seat configuration'
      });
    }
    
    // Check if airline exists
    const airlineExists = await pool.query(
      'SELECT airline_id FROM airlines WHERE airline_id = $1',
      [airline_id]
    );
    
    if (airlineExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    }

    const result = await pool.query(`
      UPDATE aircraft
      SET 
        model = $1, 
        total_seats = $2, 
        econ_seats = $3, 
        busi_seats = $4, 
        airline_id = $5,
        registration_number = $6,
        manufacturer = $7,
        year_manufactured = $8,
        max_range_km = $9,
        status = $10
      WHERE aircraft_id = $11
      RETURNING *
    `, [
      model, 
      total_seats, 
      econ_seats, 
      busi_seats, 
      airline_id,
      registration_number || null,
      manufacturer || null,
      year_manufactured || null,
      max_range_km || null,
      status || 'Active',
      id
    ]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aircraft not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Aircraft updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation\
      console.log('Error creating aircraft:', error.message)
      res.status(404).json({
        success: false,
        message: 'Airline not found'
      });
    } else if (error.code === '23505') { // Unique constraint violation
      console.log('Error creating aircraft:', error.message)
      res.status(409).json({
        success: false,
        message: 'Aircraft with this registration number already exists'
      });
    } else {
      console.log('Error creating aircraft:', error.message)
      res.status(500).json({
        success: false,
        message: 'Failed to update aircraft',
        error: error.message
      });
    }
  }
};

const deleteAircraft = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid aircraft ID'
      });
    }
    
    const result = await pool.query(`
      DELETE FROM aircraft 
      WHERE aircraft_id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aircraft not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Aircraft deleted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      res.status(409).json({
        success: false,
        message: 'Cannot delete aircraft. It may be associated with existing flights.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete aircraft',
        error: error.message
      });
    }
  }
};

module.exports = {
  getAllAircraft,
  getAircraftById,
  getAircraftByAirline,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  getAircraftByIdfly
};