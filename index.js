require('dotenv').config();
let useroe=""
const express = require('express')
const app = express();
const DB = require('./db/db');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
setInterval(function () {
    DB.query('SELECT 1');
    }, 5000);
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    cookie: {
      maxAge: 360000, //10 Hour 000000
    //10 Hour 
    },
    resave: false,
    name: ""
  }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 4000);

app.get("/",async(req,res)=>{
    res.render("index");
})
app.get("/register",async(req,res)=>{
    res.render("register");
})
app.post('/auth', async (req, res) => {
    console.log(req.body);
    const mail = req.body.email;
    const pass = req.body.pass;
    if (mail && pass) {
        DB.query('SELECT * FROM users WHERE email = ?', [mail], async (error, results) => {
            //se comprueba el usuario
            if (results.length == 0) {
                    res.send('user  incorrecto');
            }
            //se comprueba la contraseña
            else if (!(await bcryptjs.compare(pass, results[0].password))) {
                res.send('contraseña  incorrecta');
            }
            else {
                if (results[0].tipo == 'student') {
                req.session.loggedin = true;                
				req.session.name = results[0].user;
           
                        DB.query('SELECT * FROM objetivos WHERE user = ?',[results[0].user], (err, rowss, fields) => {
                            if (!err) {
                                DB.query('SELECT * FROM oe WHERE user = ?',[results[0].user], (err, rows, fields) => {
                                    res.render('student',{
                                        user:results[0].user,
                                        rowss,rows
                                    }) 
                                })                      
                            } else {
                              console.log(err)
                            }
                          })
                    }
               // res.render("student",{user:results[0].user});             
                else if (results[0].tipo == 'teacher') {
                req.session.loggedin = true;                
				req.session.name = results[0].user;
                DB.query('SELECT * FROM objetivos', (err, rowss, fields) => {
                    res.render("teacher", {rowss});
                  })

                } 
            }
        })
    }
})
app.post('/register', async (req, res) => {
  
  
    const mail = req.body.email;
    const pass = req.body.pass;
    const user = req.body.usuario;
    const tipo = req.body.tipo;
    let password = await bcryptjs.hash(pass, 8);
    DB.query('INSERT INTO users SET ?', {user: user, password: password, email: mail, tipo:tipo}, async (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('index')
                console.log('todo re piola wacho');

        }
    })
    
})
app.post("/principal",async(req,res)=>{
    const user =req.body.user
    const obj = req.body.principal
    const trayecto = req.body.trayecto
    const carrera = req.body.carrera
    DB.query('SELECT * FROM objetivos WHERE user = ?', [user], async (error, results) => {
        if(results.length>0){
            DB.query("UPDATE objetivos SET principal = '" + obj + "', trayecto ='" + trayecto + "', carrera ='" + carrera + "' WHERE user = '" + user+"'", async (err, result) => {
                if(!err){
                 
                    DB.query('SELECT * FROM objetivos WHERE user = ?',[user], (err, rowss, fields) => {
                        if (!err) {
                            DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rows, fields) => {
                                res.render('student',{
                                    user:results[0].user,
                                    rowss,rows
                                }) 

                            })
                     
                        
                         /*   DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rows, fields) => {
                                if(!err){
                                    proy.push(rows);
                                    console.log(proy)  
                                   
                                }
                            })
                
                           */
                        } else {
                          console.log(err)
                        }
                      })
                  
                }else{
                    console.log(err)
                }
            })
  
        }else{
            DB.query('INSERT INTO objetivos SET ?', {user: user,principal: obj, trayecto: trayecto, carrera:carrera}, async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    DB.query('SELECT * FROM objetivos WHERE user = ?',[user], (err, rowss, fields) => {
                        if (!err) {
                            DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rows, fields) => {
                                res.render('student',{
                                    user:user,
                                    rowss,rows
                                })
                            })   
                        } else {
                          console.log(err)
                        }
                      })
                }
            })
        }
   
    })
    
})
app.post("/OE",async(req,res)=>{
    console.log(req.body.user)
    
    const user = req.body.user
    const OE = req.body.OE
    const tarea =req.body.tarea
    const proy =[]
    DB.query('INSERT INTO oe SET ?', {user: user,objetivoE:OE,tarea:tarea}, async (error, results) => {
        if (error) {
            console.log(error);
        } else {
            DB.query('SELECT * FROM objetivos WHERE user = ?',[user], (err, rowss, fields) => {
                if (!err) {
                    DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rows, fields) => {
                        res.render('student',{
                            user:user,
                            rowss,rows
                        })
                    })   
                } else {
                  console.log(err)
                }
              })
          
            
        }
    })
})
app.post("/UpdateOE/:id",async(req,res)=>{
    
    const id = req.params.id
    console.log(req.params.id)
    const obj= req.body.OE
    const tarea= req.body.tarea
    const user =req.body.user
    DB.query("UPDATE oe SET objetivoE = '" + obj + "', tarea ='" + tarea + "' WHERE id = " + id, async (err, result) => {
        if(!err){
         
            DB.query('SELECT * FROM objetivos WHERE user = ?',[user], (err, rowss, fields) => {
                if (!err) {
                    DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rows, fields) => {
                        res.render('student',{
                            user:user,
                            rowss,rows
                        }) 

                    })
                } else {
                  console.log(err)
                }
              })
          
        }else{
            console.log(err)
        }
    })
})
app.post("/DeletePrincipal/:user",async(req,res)=>{
    const user = req.params.user
    DB.query("DELETE FROM oe WHERE user = ?", [user], (err, results) => {
        if(err){
            console.log(err)
        }else{
            DB.query("DELETE FROM objetivos WHERE user = ?", [user], (err, results) => {
                if(err){
                    console.log(err)
                }else{
                    
                    DB.query('SELECT * FROM objetivos', (err, rowss, fields) => {
                        res.render("teacher", {rowss});
                      })
                }
            })
        }
    })
})
app.get("/proyect/:user",async(req,res)=>{
    const user = req.params.user
    useroe=user;
     DB.query('SELECT * FROM oe WHERE user = ?',[user], (err, rowss, fields) => {
         if(!err){
            res.render("proyecto", {rowss});
         }else{
             console.log(err)
         }
    
    })
      
})
app.listen(app.get("port"),() =>{
    console.log(`server running on port ${app.get('port')}` )
})