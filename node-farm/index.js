const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');



const productData = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const objectData = JSON.parse(productData);
const tmpOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tmpProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tmpCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

const slugs = objectData.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);
const server = http.createServer((req, res) => {

    const { query, pathname } = url.parse(req.url, true);
    if (pathname === "/" || pathname === "/overview") {
        res.writeHead(200, {
            "Content-type": "text/html"
        });
        const output = objectData.map(el => replaceTemplate(tmpCard, el)).join("");
        res.end(tmpOverview.replace(/{%PRODUCT_CARDS%}/g, output));

    } else if (pathname === "/product") {
        res.writeHead(200, {
            "Content-type": "text/html"
        });

        const product = objectData[query.id];
        const output = replaceTemplate(tmpProduct, product);
        res.end(output);
    }
    else if (pathname === "/api") {
        res.writeHead(200, {
            "Content-type": "application/json"
        });
        res.end(productData);
    }
    else {
        res.writeHead(404, {
            "Content-type": "text/html",
            "test-header": "hello-world"
        });
        res.end("<h1>Page not found</h1>");
    }
});


server.listen(8000, "127.0.0.1", () => {
    console.log("Listening to requests on port 8000");
});

