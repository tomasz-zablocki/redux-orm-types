import createDatabase, { Table, Database } from './db';
import Model from './Model';
import Session, { OrmSession } from './Session';

/**
 * ORM - the Object Relational Mapper.
 *
 * Use instances of this class to:
 *
 * - Register your {@link Model} classes using {@link ORM#register}
 * - Get the empty state for the underlying database with {@link ORM#getEmptyState}
 * - Start an immutable database session with {@link ORM#session}
 * - Start a mutating database session with {@link ORM#mutableSession}
 *
 * Internally, this class handles generating a schema specification from models
 * to the database.
 */
export class ORM<S extends ORM.Schema, ORegistry extends ORM.Registry<S> = ORM.Registry<S>> {
    /**
     * Creates a new ORM instance.
     */
    constructor(opts?: ORM.ORMOpts);

    /**
     * Registers a {@link Model} class to the ORM.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call, unless a custom through model has been specified.
     *
     * @param  model - a {@link Model} class to register
     */
    register(...model: ReadonlyArray<S[number]>): void;

    /**
     * Gets a {@link Model} class by its name from the registry.
     *
     * @param  modelName - the name of the {@link Model} class to get
     *
     * @throws If {@link Model} class is not found.
     *
     * @return the {@link Model} class, if found
     */
    get<K extends keyof ORegistry>(modelName: K): ORegistry[K];

    /**
     * Returns the empty database state.
     *
     * @see {@link ORM.State}
     *
     * @return empty state
     */
    getEmptyState(): ORM.State<S>;

    /**
     * Begins an immutable database session.
     *
     * @see {@link ORM.State}
     * @see {@link OrmSession}
     *
     * @param  state  - the state the database manages
     *
     * @return a new {@link OrmSession} instance
     */
    session(state?: ORM.State<S>): OrmSession<S>;

    /**
     * Begins an mutable database session.
     *
     * @see {@link ORM.State}
     * @see {@link OrmSession}
     *
     * @param  state  - the state the database manages
     *
     * @return a new {@link OrmSession} instance
     */
    mutableSession(state: ORM.State<S>): OrmSession<S>;

    /**
     * Acquire database reference.
     *
     * If no database exists, an instance is created using either default or supplied implementation of {@link createDatabase}.
     *
     * @return A {@link Database} instance structured according to registered schema.
     */
    getDatabase(): Database<S>;
}

export namespace ORM {
    /** ORM instantiation opts - enables customization of database creation. */
    interface ORMOpts {
        createDatabase: typeof createDatabase;
    }

    /** Schema definition - an array of {@link Model.Class} constructor functions */
    type Schema = ReadonlyArray<Model.Class>;

    /** A map of schema {@link Model} classes ({@link Model.Class}, indexed by `{@link Model#modelName}` */
    type Registry<S extends Schema> = {
        [K in S[number]['modelName']]: Extract<S[number], { modelName: K }>;
    };

    /** A mapped type capable of inferring ORM branch state type based on schema {@link Model.Class} . */
    type State<S extends Schema> = {
        [K in keyof Registry<S>]: Table.TableState<Registry<S>[K]>;
    };
}

export default ORM;
