The backend:

You need a mongoDB. Im using one from Mongo Atlas https://www.mongodb.com/
But you can have one locally of course. 
The database need two collections, admins and problems.

You also need to create a .env file with:  
DATABASE_URL: In this case it goes to the mongo atlas db  
DATABASE_URL_TEST: Lets you run the integration tests  
JWT_SECRET: Lets you code/decode your jwt  


