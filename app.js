var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
const mercadopago = require("mercadopago");

var app = express();

mercadopago.configure({
    access_token : "APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439",
    integrator_id : "dev_2e4ad5dd362f11eb809d0242ac130004"
});

let comprador = {
    name: "Lalo",
    surname: "Landa",
    email: "test_user_46542185@testuser.com",
    phone: {
        area_code:"52",
        number: 5549737300
    },
    identification:{
        type:"DNI",
        number:"22334445"
    },
    address:{
        zip_code:"03940",
        street_name:"Insurgentes Sur",
        street_number:1602
    }
};

let payment_methods = {
    excluded_payment_methods: [
        {
            id: "diners"
        }
    ],
    excluded_payment_types: [
        {
            id: "atm"
        }
    ],
    installments: 6,
};

let back_urls = {};

let preference = {
    payment_methods : payment_methods,
    items : [],
    payer : comprador,
    back_urls : back_urls,
    notification_url : "https://moisesml-mp-ecommerce-nodejs.herokuapp.com/notificaciones?source_news=webhooks",
    external_reference : "lazaromoises06@gmail.com",
    auto_return : "approved",
};
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', async (req, res) => {
    let item = {
        id: "1234",
        title: req.query.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: 'https://'+req.get("host")+req.query.img.substring(1),
        quantity: +req.query.unit,
        currency_id: "PEN",
        unit_price: +req.query.price
    };
    preference.back_urls = {
        success: `${req.get("host")}/success`,
        pending: `${req.get("host")}/pending`,
        failure: `${req.get("host")}/failure`
    }
    preference.items = [];
    preference.items.push(item);
    preference.notification_url = `${req.get("host")}/notificaciones?source_news=webhooks`;
    let respuesta = await mercadopago.preferences.create(preference);
    req.query.id = respuesta.body.id;
    req.query.init_point = respuesta.body.init_point;
    res.render('detail', req.query);
    console.log(req.query.img.substring(1))
    console.log(item)
});

app.get("/success", function(req,res){
    res.render("success", req.query)
});

app.get("/pending", function(req,res){
    res.render("pending", req.query)
});

app.get("/failure", function(req,res){
    res.render("failure", req.query)
});

app.post("/notificaciones", function(req, res){
    console.log(req.query);
    console.log(req.body);
    res.status(200).send("Notificación recibida")
});

app.listen(port);