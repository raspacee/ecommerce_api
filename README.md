# Ecommerce API (NodeJS, Express, PostgreSQL and Elasticsearch)

A RESTful API that exposes MVP services for a ecommerce product such as updating stock, user creation, searching for products,
placing an order, tracking an order, shipping the orders and fulfilling them.

### Other Features

- Full text search on the product's name and description so that users can find products easily (using elasticsearch)
- API routes to get bargraphs and piecharts for a product's sales for analysis purposes
- Integration of Esewa pay
- Separation of user and admin authentication
- Separate logging of errors and other requests to different files
- Routes to add new products and update them accordingly
- Placing reviews on a product is possible
- Follows the MVC architecture and RESTful API standards, etc.

### How to run

Prerequisities - PostgreSQL and latest NodeJS must be installed on the system.
Installing elasticsearch is optional as this API can run without elasticsearch but the search functionality will not work.

1. Create a `.env` file in the root directory
2. The following variables are required in the `.env` file
   | Variable Name | Description |
   |-------------------|------------------------------------------------------|
   | USER_JWT_SECRET | 32 length string used for signing the user's JWT token |
   | ADMIN_JWT_SECRET | 32 length string used for signing the admin's JWT token |
   | DB_HOST | Host where the postgreSQL server is running on |
   | DB_PORT | The port running that postgreSQL is running on |
   | DB_USER | PostgreSQL server username |
   | DB_NAME | Name of the database |
   | DB_PASSWORD | Password of the database |
   | ELASTICSEARCH_URL(optional) | URL of the elasticsearch server |
   | ELASTICSEARCH_USERNAME(optional) | Username of elasticsearch |
   | ELASTICSEARCH_PASSWORD(optional) | Password of elasticsearch |
3. Run `npm install` to instal all dependencies
4. Run `npm run start` to start a production server or `npm run start-dev` to start a development server
5. For now you have to manually run the SQL scripts inside the `db` directory to initialize the
   database tables

### Inserting tables

Create a database called 'ecommerce_api' in PostgreSQL first, then run this command below
`export user=[YOUR-DB-USERNAME] database=[YOUR-DB-NAME] && ./db/createTables.sh`

### Loading fake data in the database tables

The scripts and generated csv data are located insid ethe `fake_db` directory.<br/>
Edit and uncomment lines in the `fake_db/populateDb.js` file and run it to load data in the database.

### API explained

The API is divided into four sections -

1. `/api/user` - requests related to user<br/>
   handles user signup, login, updating information, logging all orders, etc
2. `/api/admin` - requests related to admin<br/>
   handles admin login, adding new products, updating products, adding supplies and shippers
3. `/api/product` - requests related to product<br/>
   handles placing orders, tracking orders, searching products, posting reviews, etc
4. `/api/chart` - related to charts and graphs for the sales of products<br/>
   generates different bargraphs and piecharts that can be used for analysis purpose
