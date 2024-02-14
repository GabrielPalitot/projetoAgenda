require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');

const app = express();
const port = 4000;

mongoose.connect(process.env.CONNECTIONSTRING)
.then(()=>{
    app.emit('pronto');
})
.catch((e) =>{
    console.log("Deu erro: " + e);
})


const sessionOptions = session({
    secret:'qualquercoisa',
    store: MongoStore.create({mongoUrl:process.env.CONNECTIONSTRING}),
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*60*24*7,
        httpOnly: true
    }
});

app.on('pronto', ()=>{
    app.listen(port, ()=>{
        console.log(`Escutando na porta ${port}`);
        console.log(`Acesse em: http://localhost:${port}`);
    });
});

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname,'public')));
app.use(sessionOptions);
app.use(flash());
app.use(csrf());
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);


app.set('views', path.resolve(__dirname, 'src','views'));
app.set('view engine', 'ejs');


