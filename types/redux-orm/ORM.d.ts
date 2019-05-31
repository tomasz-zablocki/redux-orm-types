import { DB, DBCreator, SchemaSpec, TableState } from './db';
import { AnyModel, ModelType } from './Model';
import Session from './Session';

export interface ORMOpts {
    createDatabase: DBCreator;
}

/**
 * A `{typeof Model[modelName]: typeof Model}` specifying:
 * - database schema
 * - {@link Session} bound Model classes
 * - ORM branch state type
 */
export type IndexedModelClasses<
    T extends { [k in keyof T]: typeof AnyModel },
    K extends keyof T = Extract<keyof T, T[keyof T]['modelName']>
> = { [k in K]: T[K] };

/**
 * A mapped type capable of inferring ORM branch state type based on schema {@link Model}s
 */
export type OrmState<MClassMap extends IndexedModelClasses<any>> = {
    [K in keyof MClassMap]: TableState<InstanceType<MClassMap[K]>>
};

/**
 * A mapped type providing inference of dynamic {@link Session} properties.
 *
 * When returned from {@link ORM.session} call, the {@link Session} instance
 * is extended with session bound Model classes, accessible at {@link Model#modelName} keys.
 */
export type SessionType<I extends IndexedModelClasses<any>> = Session<I> &
    { [K in keyof I]: ModelType<InstanceType<I[K]>> };

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
export class ORM<I extends IndexedModelClasses<any>, ModelNames extends keyof I = keyof I> {
    constructor(opts?: ORMOpts);
    register(...model: ReadonlyArray<I[ModelNames]>): void;
    registerManyToManyModelsFor(model: I[ModelNames]): void;
    get<K extends ModelNames>(modelName: K): I[K];
    getModelClasses(): ReadonlyArray<I[ModelNames]>;
    generateSchemaSpec(): SchemaSpec<I>;
    getDatabase(): DB<I>;
    getEmptyState(): OrmState<I>;
    session(state: OrmState<I>): SessionType<I>;
    mutableSession(state: OrmState<I>): SessionType<I>;
}

export default ORM;
