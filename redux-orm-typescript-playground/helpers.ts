import { attr, fk, many, Model, oneToOne, ORM } from 'redux-orm';

/**
 * These utils create a database schema for testing.
 * The schema is simple but covers most relational
 * cases: foreign keys, one-to-ones, many-to-many's,
 * named reverse relations.
 */

export function createTestModels(): { [k: string]: any } {
    const Book = class BookModel extends Model<typeof BookModel> {
        static modelName = 'Book' as const;

        static get fields() {
            return {
                id: attr(),
                name: attr(),
                releaseYear: attr(),
                author: fk('Author', 'books'),
                cover: oneToOne('Cover'),
                genres: many('Genre', 'books'),
                tags: many('Tag', 'books'),
                publisher: fk('Publisher', 'books')
            };
        }
    };

    const Author = class AuthorModel extends Model<typeof AuthorModel> {
        static modelName = 'Author' as const;

        static get fields() {
            return {
                id: attr(),
                name: attr(),
                publishers: many({
                    to: 'Publisher',
                    through: 'Book',
                    relatedName: 'authors'
                })
            };
        }
    };

    const Cover = class CoverModel extends Model {
        static modelName = 'Cover';
        static fields = {
            id: attr(),
            src: attr()
        };
    };

    const Genre = class GenreModel extends Model<typeof GenreModel> {
        static modelName = 'Genre';
        static fields = {
            id: attr(),
            name: attr()
        };
    };

    const Tag = class TagModel extends Model {
        static modelName = 'Tag';
        static options = {
            idAttribute: 'name'
        };
        static fields = {
            name: attr(),
            subTags: many('this', 'parentTags')
            // TODO: bidirectional many-to-many relations
            // synonymousTags: many('Tag', 'synonymousTags'),
        };
    };

    const Publisher = class PublisherModel extends Model {
        static modelName = 'Publisher';
        static fields = {
            id: attr(),
            name: attr()
        };
    };

    const Movie = class MovieModel extends Model {
        static modelName = 'Movie';
        static fields = {
            id: attr(),
            name: attr(),
            rating: attr(),
            hasPremiered: attr(),
            characters: attr(),
            meta: attr(),
            publisherId: fk({
                to: 'Publisher',
                as: 'publisher',
                relatedName: 'movies'
            })
        };
    };

    return {
        Book,
        Author,
        Cover,
        Genre,
        Tag,
        Publisher,
        Movie
    };
}

export function createTestORM(customModels?: { [k: string]: any }) {
    const models = customModels || createTestModels();
    const { Book, Author, Cover, Genre, Tag, Publisher, Movie } = models;

    const orm = new ORM();
    orm.register(Book, Author, Cover, Genre, Tag, Publisher, Movie);
    return orm;
}
