const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = 'jibon_onk_kothin';

const authController = {
    
    register: async (req, res) => {
        try{
            const {first_name,last_name,email,password,phone_number,date_of_birth,address} = req.body;

            const check = await pool.query(`
                SELECT * FROM customer
                WHERE email = $1 OR phone_number = $2
            `,[email,phone_number]);
            if(check.rowCount!=0){
                res.json({
                    "status" : "falied",
                    "log" : "user already exists with same email/phone_number"
                });
            }

            const hashed_password = bcrypt.hash(password,10);
            const result = await pool.query(`
                INSERT INTO customer(first_name,last_name,email,password,phone_number,date_of_birth,address) VALUES ($1,$2,$3,$4,$5,$6,$7)
                RETURNING *
            `,[first_name,last_name,email,hashed_password,phone_number,date_of_birth,address]);
        
            if(result.rowCount!=0){
                res.status(201).json({
                    "status" : "sucess",
                    "log" : "user registered",
                    "user": result.rows[0]
                });
            }
        }
        catch(err){
            res.status(500).json({
                "status": "failed",
                "log": "database error",
                "error": err.message
            });
        }
        



    },
    
    
    login: async (req, res) => {
        try{
            const {email,password} = req.body;
            
        }
        catch(error){

        }
    }
};

module.exports = authController;