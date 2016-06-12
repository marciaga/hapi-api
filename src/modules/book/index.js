import Boom from 'boom';
import Joi from 'joi';
import uuid from 'node-uuid';
// exports.register registers the plugin with Hapi
exports.register = function(server, options, next) {
    const db = server.plugins['hapi-mongodb'].db
    const books = db.collection('books');
    // GET all books
    server.route({
        method: 'GET',
        path: '/books',
        handler: function(request, reply) {
            books.find().toArray((err, docs) => {
                    if (err) {
                        return reply(Boom.badData('Internal MongoDB Error', err));
                    }
                    reply(docs);
                }
            )
        }
    });
    // GET ONE book by id
    server.route({
        method: 'GET',
        path: '/books/{id}',
        handler: function(request, reply) {
            books.findOne({
                _id: request.params.id
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.badData('Internal MongoDB Error', err));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }
                reply(doc);
            });
        }
    });
    // POST Create one book
    server.route({
        method: 'POST',
        path: '/api/books',
        handler: function(request, reply) {
            const book = request.payload;
            // generate an id
            book._id = uuid.v1();
            books.save(book, (err, result) => {
                if (err) {
                    console.log('err!')
                    return reply(Boom.badData('Internal MongoDB Error', err));
                }
                reply(book);
            });
        },
        config: {
            validate: {
                payload: {
                    title: Joi.string().min(10).max(50).required(),
                    author: Joi.string().min(10).max(50).required(),
                    isbn: Joi.number()
                }
            }
        }
    });
    // PATCH Update one book
    server.route({
        method: 'PATCH',
        path: '/api/books/{id}',
        handler: function(request, reply) {
            books.update(
                { _id: request.params.id },
                { $set: request.payload },
                function(err, result) {
                    if (err) {
                        return reply(Boom.badData('Internal MongoDB Error', err));
                    }

                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }
                    // return nothing... Maybe we should return something though
                    reply().code(204);
                }
            );
        },
        config: {
            validate: {
              payload: Joi.object({
                title: Joi.string().min(10).max(50).optional(),
                author: Joi.string().min(10).max(50).optional(),
                isbn: Joi.number().optional()
                }).required().min(1) // at least one attribute must be set
            }
        }
    });
    // DELETE delete one book
    server.route({
        method: 'DELETE',
        path: '/api/books/{id}',
        handler: function(request, reply) {
            books.remove(
                { _id: request.params.id },
                function(err, result) {
                    if (err) {
                        return reply(Boom.badData('Internal MongoDB Error'));
                    }

                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }
                    // TODO Responds with nothing: maybe respond with something
                    reply().code(204);
                }
            )
        }
    })
    return next();
};
exports.register.attributes = {
    name: 'routes-books'
};
