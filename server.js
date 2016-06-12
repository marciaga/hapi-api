import Hapi from 'hapi';
import mongojs from 'mongojs';
import good from 'good';
import goodConsole from 'good-console';
import * as books from './src/modules/book/index';

const server = new Hapi.Server();
server.connection({ port: 3000 });
const options = {
    reporters: {
        console: [{
            module: 'good-console',
            args: [{ log: '*', response: '*' }]
        }, 'stdout'
        ]
        // {reporter: goodConsole
        // events: { log: '*', response: '*' }
    }
};
// connect to MongoDB: param is DB name
server.app.db = mongojs('hapi-rest-mongo');

// Load plugins and start server
server.register([
        books,
        {
            register: good,
            options: options
        }
    ],
    err => {
        if (err) {
            throw err;
        }

        server.start(err => {
            console.log('Server running at: ', server.info.uri);
        });
    }
);
