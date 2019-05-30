import { AnyModel, IdType, Ref } from '../Model';

export interface TableSpec<MClass extends typeof AnyModel> {
    fields?: Ref<InstanceType<MClass>>;
}

export interface TableOpts<MClass extends typeof AnyModel> extends TableSpec<MClass> {
    idAttribute?: string;
    arrName?: string;
    mapName?: string;
}

export type Table<MClass extends typeof AnyModel> = new (opts?: TableOpts<MClass>) => Table<MClass>;

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
