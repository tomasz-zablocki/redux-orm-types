import { AnyModel, Ref } from '../Model';

export interface TableSpec<MClass extends typeof AnyModel> {
    fields?: Ref<InstanceType<MClass>>;
}

export interface TableOpts<MClass extends typeof AnyModel> extends TableSpec<MClass> {
    idAttribute?: string;
    arrName?: string;
    mapName?: string;
}

export class Table<MClass extends typeof AnyModel> {
    constructor(opts?: TableOpts<MClass>);
    accessIds(): void;
}
