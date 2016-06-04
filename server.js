import Async from 'async';
import Bell from 'bell';
import Blipp from 'blipp';
import Hapi from 'hapi';
import HapiAuthCookie from 'hapi-auth-cookie';
import Hoek from 'hoek';
/*
import Api from './api';
import Authentication from './authentication';
import Controllers from './controllers';
import Models from './models';
import Routes from './routes';
*/

const internals = {
    servers: {
        http: {
            port: 8080,
            host: '0.0.0.0',
            labels: ['http']
        },
        api: {
            port: 8088,
            host: '0.0.0.0',
            labels: ['api']
        }
    },
    options: {
        files: {
            relativeTo: __dirname
        }
    }
};

exports.init = function(callback) {
    let server = new Hapi.Server();
    server.connection(internals.servers.http);
    server.connection(internals.servers.api);
    server.path(internals.options.files.relativeTo);

    let registerHttpPlugins = (next) =>
        server.register(
            [
                Bell,
                Blipp,
                HapiAuthCookie,
                // Authentication,
                // Controllers,
                // Models,
                // Routes
            ],
            { select: 'http' },
            (err) => next(err)
        );

    let registerApiPlugins = (next) =>
        server.register(
            [
                Blipp,
                // Controllers,
                // Models,
                // Api
            ],
            { select: 'api' },
            (err) => next(err)
        );

    server.on('request-error', (request, response) => {
        console.log('request-error');
        console.dir(response);
    });

    Async.auto(
        {
            http: registerHttpPlugins,
            api: registerApiPlugins
        },
        (err, data) => {
            if(err) {
                console.log('server.register err: ', err);
                return callback(err);
            }

            server.start(() => callback(null, server));
        }

    )
};

exports.init(Hoek.ignore);
