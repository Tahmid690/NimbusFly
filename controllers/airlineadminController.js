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
        email:email
     },JWT_SECRET,{expiresIn:'24h'});


      return res.json({
                "status": "success",  // Fixed this!
                "log": "login successful",
                "jwt_token": token,
                "user": {
                    admin_id: result.rows[0].admin_id,
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

module.exports={
    register,
    login,
    getAdminById,
    updateAdmin,
    deleteAdmin
}