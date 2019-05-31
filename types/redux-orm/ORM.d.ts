import { DB, DBCreator, SchemaSpec, TableState } from './db';
import { AnyModel, ModelType } from './Model';
import Session from './Session';

export interface ORMOpts {
    createDatabase: DBCreator;
}

export type IndexedModelClasses<
    T extends { [k in keyof T]: typeof AnyModel },
    K extends keyof T = Extract<keyof T, T[keyof T]['modelName']>
> = { [k in K]: T[K] };

export type OrmState<MClassMap extends IndexedModelClasses<any>> = {
    [K in keyof MClassMap]: TableState<InstanceType<MClassMap[K]>>
};

export type SessionType<I extends IndexedModelClasses<any>> = Session<I> &
    { [K in keyof I]: ModelType<InstanceType<I[K]>> };

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
