const nodeMailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');
const path  = require('path');

class createMail{
    constructor(user, url){
        this.to = user.email,
        this.from = `Social.com ${process.env.EMAIL_FROM}`,
        this.url = url,
        this.name = user.name
    }

    newTransport(){
        //
        return nodeMailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

    }
    //Generic method to send Mail
    async send(template, subject){
        const html = template;

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html
        };

        await this.newTransport().sendMail(mailOptions);
    }

    // method for Password Reset
    async sendPasswordResetMail(){
        //1)get template ready
            let data= {
                url: this.url,
                name: this.name
            };
            let template = this.createTemplate(data,'passwordReset.ejs')  
        //2)use generic send method to send the mail
        await this.send(template, "Password Reset From Social.Com");
    }

    createTemplate(data,relativePath){
        let mailTemplate;
        ejs.renderFile(
            path.join(__dirname,'..','/views/mailTemplates/',relativePath),
            data,
            function(err, template){
                if(err){
                    console.log('Error while rendering mail template',err);
                }
                mailTemplate = template;
            }
        );
        return mailTemplate;
    }
}
module.exports = createMail;
