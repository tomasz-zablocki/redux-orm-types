import { DB, DBCreator, SchemaSpec, TableState } from './db';
import { ModelType } from './Model';
import Session from './Session';
import { IndexedModelClasses } from './helpers';

export interface ORMOpts {
    createDatabase: DBCreator;
}
export type OrmState<MClassMap extends IndexedModelClasses<any>> = {
    [K in keyof MClassMap]: TableState<InstanceType<MClassMap[K]>>
};

export type SessionType<I extends IndexedModelClasses<any>,
> = Session<I> & { [K in keyof I]: ModelType<InstanceType<I[K]>> };

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
