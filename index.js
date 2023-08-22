const express = require('express');
const app = express();
require('dotenv').config();
const PORT = 3000;
require('./config/passportOAtuh');
const expressLayouts = require('express-ejs-layouts');
const AppError = require('./utils/errorClass');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const db = require('./config/mongoose');
const customMiddleware = require('./middleware/customMiddleware');
const errorController = require('./controllers/errorController');
const flash = require('connect-flash');


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// extract styles and scripts for sub pages
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

app.use(express.static('./assets'));

app.use(express.urlencoded({extended:true}));
app.use(expressLayouts);
app.use(session({
    secret: "MYSECRET123#$$YUO",
    name: "socialA",
    cookie: {
        samesite: 'strict',
        maxAge: (1000 * 60 * 100)
    },
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.SESSION_URL       
      })
    
}));


app.use(flash());
app.use(customMiddleware.setFlash);
app.use('/',require('./routes/index'));

//Error Handling for undefined routes 
app.all('*', (req,res,next)=>{
    next(new AppError(404,`Cannot find ${req.originalUrl}`));
})

app.use(errorController);
app.listen(PORT,()=>{
    console.log("Server is up and running on PORT: ",PORT);
})
