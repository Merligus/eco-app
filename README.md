# eco-app
Web application where you can find places that collect certain types of biodegradable wastes. The website was developed using react and can be accessed at [hopeful-bohr-b7bfdd.netlify.app](https://hopeful-bohr-b7bfdd.netlify.app).

The back-end of the application was developed routing with express and a relational database using knex with sqlite3. The application also used multer to save image files and celebrate to validate data and is available at [merligus-eco-app.herokuapp.com](https://merligus-eco-app.herokuapp.com). The REST API was able to list all the biodegradable wastes (GET /items), create a new point of collection (POST /points), get all the points of collection (GET /points?city=c&uf=uf&items=i1,i2,...), and get a point of collection by the id (GET /points/:id). 

To install the project you must:

1. Clone the repository
   ```sh
   git clone https://github.com/Merligus/eco-app.git
   cd eco-app/
   ```
2. Server
   ```sh
   cd server/
   ```
   1. Install dependencies
      ```sh
      npm install
      ```
   2. Run the server
      1. As a developer
         ```sh
         npm run dev
         ```
      2. As an user
         ```sh
         npm run start
         ```
   3. Access the server in your browser at [localhost:3000](http://localhost:3000)
3. Web
   ```sh
   cd ../web/
   ```
   1. Install dependencies
      ```sh
      npm install
      ```
   2. Run the web
      ```sh
      npm run start
      ```
   3. Access the web in your browser at [localhost:3001](http://localhost:3001)