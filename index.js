const http = require('http');
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    fs.readFile('data.xml', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
        
            const transformedData = {
                data: {
                    indicators: result.indicators.basindbank.reduce((acc, item) => {
                        if (item.parent && item.parent[0] === 'BS3_BanksLiab') {
                            acc.push({
                                txt: item.txten ? item.txten[0] : null,
                                value: item.value ? item.value[0] : null,
                            });
                        }
                        return acc;
                    }, []),
                },
            };
        
            const xml = builder.buildObject(transformedData);
        
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(xml);
        });
        
        
    });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
