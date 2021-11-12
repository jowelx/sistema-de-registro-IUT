const mysql = require('mysql')
const connect =  mysql.createConnection({
    host:process.env.HOST_DB,
    user:process.env.USER_DB,
    password:process.env.PASSWORD_DB,
    database:process.env.DATABASE
})
connect.connect(function(err){
    if(err){
        console.log(err);
         return
    }else{
        console.log('Db connect')
    }
})

module.exports = connect;