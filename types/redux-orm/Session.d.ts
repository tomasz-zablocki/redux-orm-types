import { ModelClassMap, ORM, OrmState } from './ORM';
import { DB, QueryResult, QuerySpec } from './db';
import { AnyModel } from './Model';

export default class Session<
    TSchema extends Array<typeof AnyModel> = [],
    MTypes extends ModelClassMap<TSchema> = ModelClassMap<TSchema>
> {
    readonly accessedModels: Array<keyof MTypes>;
    schema: ORM<TSchema>;
    db: DB<TSchema>;
    initialState: OrmState<MTypes>;
    withMutations: boolean;
    batchToken: any;
    sessionBoundModels: ReadonlyArray<MTypes[keyof MTypes]>;
    models: ReadonlyArray<MTypes[keyof MTypes]>;
    state: OrmState<MTypes>;
    constructor(schema: ORM<TSchema>, db: DB<TSchema>, state: OrmState<MTypes>, withMutations: boolean, batchToken: any);
    markAccessed(modelName: keyof MTypes): void;
    getDataForModel(modelName: keyof MTypes): object;
    query(querySpec: QuerySpec): QueryResult;
}
