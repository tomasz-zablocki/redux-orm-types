import { ModelClassMap, ORM, OrmState, Schema } from './ORM';
import { DB, QueryResult, QuerySpec } from './db';
import { AnyModel, ModelType } from './Model';

export default class Session<T extends Schema = [], MTypes extends ModelClassMap<T> = ModelClassMap<T>> {
    readonly accessedModels: Array<keyof MTypes>;
    schema: ORM<T>;
    db: DB<T>;
    initialState: OrmState<MTypes>;
    withMutations: boolean;
    batchToken: any;
    sessionBoundModels: ReadonlyArray<MTypes[keyof MTypes]>;
    models: ReadonlyArray<MTypes[keyof MTypes]>;
    state: OrmState<MTypes>;
    constructor(schema: ORM<T>, db: DB<T>, state: OrmState<MTypes>, withMutations: boolean, batchToken: any);
    markAccessed(modelName: keyof MTypes): void;
    getDataForModel(modelName: keyof MTypes): object;
    query(querySpec: QuerySpec): QueryResult;
}

export type SessionWithModels<
    T extends Schema,
    MClassMap extends Record<string, typeof AnyModel> = ModelClassMap<T>
> = Session<T> & { [K in keyof MClassMap]: ModelType<InstanceType<MClassMap[K]>> };
