const http = require('http'); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(require("cors")()); 
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.json({message: "Tudo ok por aqui!"});
})

app.post('/send', (req, res, next) => { 
    res.json(req.body);
}) 

const server = http.createServer(app); 
server.listen(3030);
console.log("Servidor escutando na porta 3030...")

const mailer = require("nodemailer");
const { getMaxListeners } = require('process');

module.exports.enviarEmail = (nome, nome_destinatario, email_destinatario, texto) => {
    const smtpTransport = mailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, //use SSL
        auth: {
            user: 'correioelegante@zohomail.com',
            pass: 'alquwb72'
        }
    })
    
    const mail = {
        from: "Correio Elegante <correioelegante@zohomail.com>",
        to: email_destinatario,
        subject: `${nome_destinatario}, ${nome} te enviou um Correio Elegante`,
        text: texto,
        //html: "<b>Opcionalmente, pode enviar como HTML</b>"
    }    
    
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mail)
            .then(response => {
                smtpTransport.close();
                return resolve(response);
            })
            .catch(error => {
                smtpTransport.close();
                return reject(error);
            });
    })
}

 