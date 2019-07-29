import { ORM } from './ORM';

import Model from './Model';
import { Database } from './db';

export type BatchToken = any;

export default class Session<S extends ORM.Schema> {
    /**
     * list of bound {@link Model} classes bound to this session, bootstrapped during {@link @ORM.register}.
     *
     * @see {@link Model}
     */
    readonly sessionBoundModels: S;

    /**
     * Current {@link ORM.State}, specific to registered schema
     */
    readonly state: ORM.State<S>;

    /**
     * Creates a new Session.
     *
     * @param schema - {@Link ORM} instance, with bootstrapped {@link Model} prototypes.
     * @param  db - a {@link Database} instance
     * @param  state - the database {@link ORM.State}
     * @param  withMutations? - whether the session should mutate data
     * @param  batchToken? - a {@link BatchToken} used by the backend to identify objects that can be
     *                                 mutated. If none is provided a default of `Symbol('ownerId')` will be created.
     *
     */
    constructor(schema: ORM<S>, db: Database<S>, state: ORM.State<S>, withMutations?: boolean, batchToken?: BatchToken);

    /**
     * Executes query against model state.
     *
     * @param query - the query command object.
     *
     * @returns query result.
     *
     * @see {@link QueryType}
     * @see {@link QueryClause}
     * @see {@link QuerySpec}
     * @see {@link QueryResult}
     */
    query(query: Database.QuerySpec): Database.QueryResult;

    /**
     * Applies update to a model state.
     *
     * @param  update - the update command object.
     *
     * @returns applyUpdate result.
     *
     * @see {@link DbAction}
     * @see {@link UpdateSpec}
     * @see {@link DbActionResult}
     * @see {@link UpdateResult}
     */
    applyUpdate<P>(update: Database.UpdateSpec<P>): P;
}

/**
 * An {@link ORM}-bound {@link Session} instance, extended with a set of {@link Model.constructor} properties.
 *
 * Extension is a map of {@link Model} class accessible under keys within a set of {@link Model#modelName} values
 * for registered {@link Model} classes.
 */
export type OrmSession<S extends ORM.Schema> = Session<S> & ORM.Registry<S>;
