# Social_Authentication
Plug and use authentication application


Environment Variable setup steps

Add below environment variables in .env file

1) ENVIRONMENT = Production || Development 
   - Provide environment
     
2) JWT_SECRET = DUMMYSECRET123 
   - Provide any secret of your choice.
     
3) EMAIL_FROM = ABC@gmail.com
  - This email will be used to send Password recovery mails
    
4) GOOGLE_CLIENT_ID =
   - Provide valid client id from google. This is used for google authentication. You can genrate it from google credentials
     
5) GOOGLE_CLIENT_SECRET =
   - Provide valid secret from google. You can get this similiarly like client Id.
     
6) callbackURL = https://social-authentication.onrender.com/authentication/auth/google/callback
   - Add this to Authorised redirect URIs in your project in google credentials.This will be used as callback once google authentication is successful
     
7) SMTP_USER  = abc@gmail.com
   - The service to send mail is configured as gmail. Please provide a valid gmail address. This address will be used to share Password recovery mail
     
8) SMTP_PASS = "Pass"
   - Password associated with mail.
     
9) SESSION_URL =
   - Provide MongoDB URL For session storage
     
10) MONGO_URL = mongodb+srv://USER:PASS@cluster0.ax8af08.mongodb.net/?retryWrites=true&w=majority
   - MONGODB Url for database activities.
