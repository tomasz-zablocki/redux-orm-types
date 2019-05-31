import Model, { AnyModel, IdType, Ref } from '../Model';

export interface TableSpec<MClass extends typeof AnyModel> {
    fields?: Ref<InstanceType<MClass>>;
}

export interface TableOpts {
    idAttribute?: string;
    arrName?: string;
    mapName?: string;
}

export type TableProps<MClass extends typeof AnyModel, TTableOpts extends TableOpts> = TableSpec<MClass> & TTableOpts;

export interface DefaultTableOpts {
    arrName: 'items';
    mapName: 'itemsById';
    idAttribute: 'id';
}

export type Table<
    MClass extends typeof AnyModel,
    TTableProps extends TableProps<MClass, any> = DefaultTableOpts
> = new (userProps?: TTableProps) => Table<MClass, TTableProps>;

export type TableState<
    M extends Model,
    ArrName extends string = 'items',
    MapName extends string = 'itemsById',
    Meta extends object = { maxId: IdType<M> extends number ? number : null }
> = Record<ArrName, ReadonlyArray<IdType<M>>> &
    Record<MapName, { readonly [K: string]: Ref<M> }> & {
        meta: Meta;
        indexes: object;
    };
