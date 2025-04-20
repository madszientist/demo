// import required modules
const express = require('express');
const { MongoClient } = require('mongodb');

// config
const port = 3000;
const mongoUrl = 'mongodb+srv://wernerzack:zhmYN8vhGBYhTP3L@pt2-server.mkbdofv.mongodb.net/?retryWrites=true&w=majority&appName=pt2-server';
const dbName = 'node_assignment_db';
const collectionName = 'place_zip';

const app = express();
let db;
let placesCollection;

// express to parse url-encoded request
app.use(express.urlencoded({ extended: true }));

// connect to db - async
async function connectDB() {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        db = client.db(dbName);
        placesCollection = db.collection(collectionName);
        console.log(`Successfully connected to MongoDB database: ${dbName}`);
    } catch (err) {
        // log error/exit if connection fails
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

// HTML template for search page - returns {string}
function getHomePageHtml() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MA Place/Zip Search</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f4f4f4; }
                h1 { color: #333; text-align: center; }
                form { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
                input[type="text"] { width: calc(100% - 22px); padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; }
                button { display: block; width: 100%; padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <h1>Massachusetts Place & Zip Code Lookup</h1>
            <form method="POST" action="/process">
                <label for="query">Enter Place Name or Zip Code:</label>
                <input type="text" id="query" name="query" required placeholder="e.g., Cambridge or 02139">
                <button type="submit">Search</button>
            </form>
        </body>
        </html>
    `;
}

// HTML template for results page - returns {string}
function getResultsPageHtml(query, result, error = null) {
     return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Search Results</title>
             <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f4f4f4; }
                h1 { color: #333; text-align: center; }
                .result-box { background-color: #fff; padding: 20px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .result-box h2 { margin-top: 0; color: #007bff; }
                .result-box p { line-height: 1.6; }
                .error { color: #dc3545; font-weight: bold; text-align: center; }
                a { display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Search Results</h1>
            <div class="result-box">
                ${error ? `<p class="error">${error}</p>` : ''}
                ${result ? `
                    <h2>Results for "${query}"</h2>
                    <p><strong>Place:</strong> ${result.place}</p>
                    <p><strong>Associated Zip Codes:</strong> ${result.zips.join(', ')}</p>
                ` : (!error ? `<p>No results found for "${query}".</p>` : '')}
            </div>
            <a href="/">Perform another search</a>
        </body>
        </html>`;
}

// send HTML form
app.get('/', (req, res) => {
    res.send(getHomePageHtml());
});

// process form submission ('/process')
app.post('/process', async (req, res) => {
    // get query string
    const query = req.body.query?.trim();

    let htmlOutput;
    let consoleOutput = '';
    let searchCriteria = {};
    let result = null;
    let errorMsg = null;

    // log new search
    console.log(`\n--- New Search Request ---`);
    console.log(`Received query: "${query}"`);

    // check for empty query
    if (!query) {
        errorMsg = 'Error: Please provide a place name or zip code.';
        console.warn(errorMsg);
        htmlOutput = getResultsPageHtml(query, null, errorMsg);
        return res.status(400).send(htmlOutput);
    }

    // check for db conn
    if (!placesCollection) {
         errorMsg = "Error: Database connection is not available. Please try again later or check server logs.";
         console.error("Database collection is not available for query.");
         htmlOutput = getResultsPageHtml(query, null, errorMsg);
         return res.status(500).send(htmlOutput);
    }

    // check that query is zip, by checking first character is digit
    const isZipSearch = /^\d/.test(query);

    try {
        if (isZipSearch) {
            // search by zip - find docs where array contains the query string
            console.log(`Searching for place by zip code: ${query}`);
            searchCriteria = { zips: query };
            // find one doc match
            result = await placesCollection.findOne(searchCriteria);
            consoleOutput = result
                ? `DB Query Result: Found place "${result.place}" for zip ${query}. All zips: [${result.zips.join(', ')}]`
                : `DB Query Result: No place found containing zip code ${query}.`;
        } else {
            // search by name - find docs where array contains query string, RegExp for case-insensitive search
            console.log(`Searching for zip codes by place name: "${query}"`);
            searchCriteria = { place: new RegExp('^' + query + '$', 'i') };
            result = await placesCollection.findOne(searchCriteria);
             consoleOutput = result
                ? `DB Query Result: Found zip codes for "${result.place}": [${result.zips.join(', ')}]`
                : `DB Query Result: No zip codes found for place "${query}".`;
        }

        // log result to the server console and generate HTML result
        console.log(consoleOutput);
        htmlOutput = getResultsPageHtml(query, result);

    // handle errors during query
    } catch (dbErr) {
        errorMsg = "An error occurred while searching the database.";
        console.error("Database query error:", dbErr);
        htmlOutput = getResultsPageHtml(query, null, errorMsg);
        res.status(500);
    }

    // send HTML page to browser
    res.send(htmlOutput);
});

// start server fcn - connects db and starts express server
async function startServer() {
    await connectDB();
    app.listen(port, () => {
        console.log(`\nWeb App #2 (Search Server) is running.`);
        console.log(`Access it at: http://localhost:${port}`);
    });
}

// execute server fcn
startServer();
