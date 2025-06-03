const jwt = require('jsonwebtoken');
const JWT_SECRET = 'bugi_na_bai_bugi_na'; 

const addMiddleware=async(req,res,next)=>{
    try{

        const head=req.headers.authorization;
        if(!head){
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }
       const token=head.split(' ')[1];
       const decoded=jwt.verify(token,JWT_SECRET);
       req.user=decoded;
       next();
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        })
    }
};

module.exports=addMiddleware;