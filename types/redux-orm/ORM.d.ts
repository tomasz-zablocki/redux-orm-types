import { DB, DBCreator, SchemaSpec } from './db';
import { AnyModel, IdType, ModelType, Ref } from './Model';
import Session from './Session';

export interface ORMOpts {
    createDatabase: DBCreator;
}

export type TableState<
    M extends AnyModel,
    ArrName extends string = 'items',
    MapName extends string = 'itemsById',
    Meta extends object = { maxId: IdType<M> extends number ? number : null }
> = Record<ArrName, ReadonlyArray<IdType<M>>> &
    Record<MapName, { readonly [K: string]: Ref<M> }> & {
        meta: Meta;
        indexes: object;
    };

export type ModelClassMap<TSchema extends Array<typeof AnyModel>> = TSchema extends Array<infer U>
    ? [U] extends [typeof AnyModel]
        ? { [K in U['modelName']]: U }
        : never
    : never;

export type OrmState<
    TSchema extends Array<typeof AnyModel>,
    MClassMap extends ModelClassMap<TSchema> = ModelClassMap<TSchema>
> = { [K in keyof MClassMap]: TableState<InstanceType<MClassMap[K]>> };

export type SessionType<
    TSchema extends Array<typeof AnyModel>,
    MClassMap extends Record<string, typeof AnyModel> = ModelClassMap<TSchema>
> = Session<TSchema> & { [K in keyof MClassMap]: ModelType<InstanceType<MClassMap[K]>> };

export class ORM<
    TSchema extends Array<typeof AnyModel> = [],
    MClassMap extends ModelClassMap<TSchema> = ModelClassMap<TSchema>,
    TSessionType = SessionType<TSchema>
> {
    constructor(opts?: ORMOpts);
    register(...model: ReadonlyArray<MClassMap[keyof MClassMap]>): void;
    registerManyToManyModelsFor(model: MClassMap[keyof MClassMap]): void;
    get<K extends keyof MClassMap>(modelName: K): MClassMap[K];
    getModelClasses(): TSchema;
    generateSchemaSpec(): SchemaSpec<TSchema>;
    getDatabase(): DB<TSchema>;
    getEmptyState(): OrmState<TSchema>;
    session(state: OrmState<TSchema>): TSessionType;
    mutableSession(state: OrmState<TSchema>): TSessionType;
}

export default ORM;
