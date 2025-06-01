const pool = require('../config/database'); // fixed import

const getCustomerPassenger = async (req, res) => {
    try {
        const id = parseInt(req.params.customer_id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Customer ID'
            });
        }
        const result = await pool.query(
            `
           select pas.*,(cus.first_name|| ' '|| cus.last_name) as Customer_Name
            from passengers pas left join customer cus
            on pas.customer_id=cus.customer_id
           where pas.customer_id=$1
            `, [id]
        );
        if (result.rows.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'Passenger of this customer Not Found'
            });
        }
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch passenger',
            error: error.message
        });
    }
};

const getPassengerById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Passenger ID'
            });
        }
        const result = await pool.query(`
          select * from passengers
          where passenger_id=$1       
        `, [id]);
        if (result.rows.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'Passenger Not Found'
            });
        }
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch passenger',
            error: error.message
        })
    }
};

const addPassenger = async (req, res) => {
    try {
        const { customer_id, first_name, last_name, date_of_birth, passport_number, nationality } = req.body;
        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: 'Customer id is required'
            });
        }

        if (!first_name) {
            return res.status(400).json({
                success: false,
                message: 'First name is required'
            });
        }

        if (!last_name) {
            return res.status(400).json({
                success: false,
                message: 'Last name is required'
            });
        }

        if (!passport_number) {
            return res.status(400).json({
                success: false,
                message: 'Passport number is required'
            });
        }

        const customerexist = await pool.query(`
            select count(*) as count from customer
            where customer_id=$1
            `, [customer_id]);
        if (parseInt(customerexist.rows[0].count) == 0) {
            return res.status(400).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const cnt = await pool.query(`
            select count(*) as count from passengers
        `);

        const result = await pool.query(`
            insert into passengers(customer_id,first_name,last_name,date_of_birth,passport_number,nationality)
            values($1,$2,$3,$4,$5,$6) returning *
            `, [ customer_id, first_name, last_name, date_of_birth, passport_number, nationality]);
        res.json({
            success: true,
            message: 'Passenger added successfully',
            data: result.rows[0]
        })

    } catch (error) {
        if (error.code === '23503') { // Foreign key constraint violation
            res.status(409).json({
                success: false,
                message: 'Customer not found.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to create passenger',
                error: error.message
            });
        }
    }
};

const updatePassenger = async (req, res) => {
    try {
        const pas_id = parseInt(req.params.id);
        const { customer_id, first_name, last_name, date_of_birth, passport_number, nationality } = req.body;

        if (isNaN(pas_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Passenger ID'
            });
        }

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: 'Customer id is required'
            });
        }

        if (!first_name) {
            return res.status(400).json({
                success: false,
                message: 'First name is required'
            });
        }

        if (!last_name) {
            return res.status(400).json({
                success: false,
                message: 'Last name is required'
            });
        }

        if (!passport_number) {
            return res.status(400).json({
                success: false,
                message: 'Passport number is required'
            });
        }

        const customerexist = await pool.query(`
            select count(*) as count from customer
            where customer_id=$1
            `, [customer_id]);
        if (parseInt(customerexist.rows[0].count) == 0) {
            return res.status(400).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const result = await pool.query(`
            update passengers
            set customer_id=$1,first_name=$2,last_name=$3,
            date_of_birth=$4,passport_number=$5,nationality=$6
            where passenger_id=$7
            returning *
            `, [customer_id, first_name, last_name, date_of_birth, passport_number, nationality, pas_id]);

        res.json({
            success: true,
            message: 'Passenger updated successfully',
            data: result.rows[0]
        })

    } catch (error) {
        if (error.code === '23503') { // Foreign key constraint violation
            res.status(409).json({
                success: false,
                message: 'Customer not found.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to update passenger',
                error: error.message
            });
        }
    }
};

const deletePassenger = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid passenger id'
            });
        }

        const result = await pool.query(`
            delete from passengers
            where passenger_id=$1
            returning *
            `, [id]);

        res.json({
            success: true,
            message: 'Passenger deleted successfully',
            data: result.rows[0]
        })

    } catch (error) {
        if (error.code === '23503') { // Foreign key constraint violation
            res.status(409).json({
                success: false,
                message: 'Cannot delete Passenger.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to delete passenger',
                error: error.message
            });
        }
    }
};

module.exports = {
    getCustomerPassenger,
    getPassengerById,
    addPassenger,
    updatePassenger,
    deletePassenger
};
