const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = 'jibon_onk_kothin';

const authController = {
    
    register: async (req, res) => {
        try{
            console.log('req korse')
            const {first_name,last_name,email,password,phone_number,date_of_birth,address} = req.body;

            if(!first_name || !last_name || !email || !password || !phone_number || !date_of_birth || !address){
                return res.status(400).json({
                    "status" : "falied",
                    "log" : "field missing"
                });
            }

            const check = await pool.query(`
                SELECT * FROM customer
                WHERE email = $1 OR phone_number = $2
            `,[email,phone_number]);
            if(check.rowCount!=0){
                return res.status(400).json({
                    "status" : "falied",
                    "log" : "user already exists with same email/phone_number"
                });
            }

            const hashed_password =await bcrypt.hash(password,10);
            const result = await pool.query(`
                INSERT INTO customer(first_name,last_name,email,password,phone_number,date_of_birth,address) VALUES ($1,$2,$3,$4,$5,$6,$7)
                RETURNING *
            `,[first_name,last_name,email,hashed_password,phone_number,date_of_birth,address]);
        
            if(result.rowCount!=0){
                return res.status(201).json({
                    "status" : "success",
                    "log" : "user registered",
                    "user": result.rows[0]
                });
            }
        }
        catch(err){
            return res.status(500).json({
                "status": "failed",
                "log": "database error",
                "error": err.message
            });
        }
        



    },
    
    
    login: async (req, res) => {
        try{
            console.log('req paisi')
            const {email,password} = req.body;
            const result = await pool.query(`
                SELECT password,customer_id,first_name,last_name
                FROM customer
                WHERE email = $1
            `,[email]);
            if(result.rowCount==0){
                return res.status(401).json({
                    "status" : "falied",
                    "log" : "user not found",
                });
            }
            if(await bcrypt.compare(password,result.rows[0].password)){
                const token = jwt.sign({ 
                    customer_id: result.rows[0].customer_id,
                    email: email 
                }, JWT_SECRET,{ expiresIn: '24h' });
                return res.json({
                    "status" : "sucess",
                    "log" : "logged_in",
                    "jwt_token" : token,
                    "user": {
                        customer_id: result.rows[0].customer_id,
                        first_name: result.rows[0].first_name,
                        last_name: result.rows[0].last_name,
                        email: email
                    }
                });
            }
            else{
                return res.status(401).json({
                    "status" : "falied",
                    "log" : "pass wrong",
                });
            }


            
        }
        catch(error){
            return res.status(500).json({
                    "status" : "falied",
                    "log" : "database error",
                });
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.user.customer_id;
            
            const result = await pool.query(`
                SELECT customer_id, first_name, last_name, email, phone_number
                FROM customer 
                WHERE customer_id = $1
            `, [userId]);
            
            return res.json({
                success: true,
                user: result.rows[0]
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching profile'
            });
        }
    }
};

module.exports = authController;