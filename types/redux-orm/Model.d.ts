import QuerySet, { MutableQuerySet, SortIteratee, SortOrder } from './QuerySet';
import {
    AttributeWithDefault,
    Field,
    FieldDescriptorMap,
    ManyToMany,
    OneToOne,
    VirtualFieldDescriptorMap
} from './fields';
import { SessionWithModels } from './Session';
import { Omit, OmitByValue, Optional, PickByValue, SetDifference, SetIntersection } from './helpers';

export type Primitive = number | string | boolean;

export type Serializable =
    | Primitive
    | Primitive[]
    | undefined
    | {
          [K: string]: Serializable | Serializable[];
      };

export type ModelField = MutableQuerySet | QuerySet | SessionBoundModel | Serializable;

export type SerializableMap = Record<string, Serializable | Serializable[]>;

export interface ModelFieldMap {
    [K: string]: ModelField;
}

export interface ModelOptions<IdKey = any> {
    idAttribute: IdKey;
}

export default class Model<MClass extends typeof AnyModel = any, Fields extends ModelFieldMap = any> {
    static readonly modelName: string;
    static readonly fields: FieldDescriptorMap;
    static readonly options: { (): ModelOptions } | ModelOptions;
    static readonly idAttribute: string;
    static readonly querySetClass: typeof QuerySet;
    static readonly virtualFields: VirtualFieldDescriptorMap;
    static readonly query: QuerySet;
    readonly ref: Ref<InstanceType<MClass>>;
    readonly __$infer$__: Fields;

    constructor(props: object);

    static reducer(action: any, modelType: ModelType<any>, session: SessionWithModels<any>): void;
    static all(): QuerySet;
    static create(props: CreateProps<Model>): SessionBoundModel<Model>;
    static upsert(props: UpsertProps<Model>): SessionBoundModel<Model>;
    static get(props: LookupProps<Model>): SessionBoundModel<Model> | null;
    static withId(id: IdType<Model>): SessionBoundModel<Model> | null;
    static idExists(id: IdType<Model>): boolean;
    static toString(): string;
    static markAccessed(): void;
    static getQuerySet(): QuerySet;
    static update(props: UpdateProps<Model>): void;
    static at(index: number): SessionBoundModel<Model> | undefined;
    static first(): SessionBoundModel<Model> | undefined;
    static last(): SessionBoundModel<Model> | undefined;
    static filter(props: LookupProps<Model>): QuerySet;
    static exclude(props: LookupProps<Model>): QuerySet;
    static orderBy(iteratees: ReadonlyArray<SortIteratee<Model>>, orders?: ReadonlyArray<SortOrder>): QuerySet;
    static count(): number;
    static exists(): boolean;
    static delete(): void;

    getClass(): MClass;
    getId(): string | number;
    toString(): string;
    equals(other: Model | SessionBoundModel): boolean;
    set<K extends string>(propertyKey: K, value: RefPropOrSimple<this, K>): void;
    update(props: UpdateProps<this>): void;
    refreshFromState(): void;
    delete(): void;
}

export class AnyModel extends Model {}

export type ModelClass<M extends Model> = ReturnType<M['getClass']>;

export type FieldDescriptors<M extends Model> = ModelClass<M>['fields'];

export type ModelFields<M extends Model> = M['__$infer$__'];

export type IdKey<M extends Model> = ModelClass<M>['options'] extends () => { idAttribute: infer R }
    ? R extends string
        ? R
        : 'id'
    : ModelClass<M>['options'] extends { idAttribute: infer R }
    ? R extends string
        ? R
        : 'id'
    : 'id';

export type IdType<M extends Model> = IdKey<M> extends infer U
    ? U extends keyof ModelFields<M>
        ? ModelFields<M>[U] extends Primitive
            ? ModelFields<M>[U]
            : never
        : number
    : number;

export type DescriptorKeys<M extends Model, TField extends Field> = keyof PickByValue<FieldDescriptors<M>, TField>;

export type OneToOneKeys<M extends Model> = DescriptorKeys<M, OneToOne>;

export type RefFields<
    M extends Model,
    TFields extends ModelFields<M> = ModelFields<M>,
    FieldKeys extends keyof TFields = keyof TFields
> = Pick<TFields, SetIntersection<FieldKeys, keyof OmitByValue<FieldDescriptors<M>, ManyToMany>>>;

export type Ref<M extends Model> = {
    [K in keyof RefFields<M>]: 'getClass' extends keyof RefFields<M>[K]
        ? ReturnType<RefFields<M>[K]['getId']>
        : RefFields<M>[K]
};

export type RefPropOrSimple<M extends Model, K extends string> = K extends keyof RefFields<M>
    ? M['ref'][K]
    : Serializable;

export type SessionBoundModelFields<M extends Model> = {
    [K in keyof ModelFields<M>]: ModelFields<M>[K] extends Model<infer TModelClass>
        ? SessionBoundModel<InstanceType<TModelClass>>
        : ModelFields<M>[K]
};

export type SessionBoundModel<M extends Model = any, InstanceProps extends SerializableMap = {}> = M &
    SessionBoundModelFields<M> &
    InstanceProps;

export type CreatePropsWithDefaults<
    M extends Model,
    TFields = ModelFields<M>,
    TRFields extends Record<keyof TFields, any> = Required<TFields>
> = {
    [K in keyof TFields]: {
        [P in K]: TRFields[P] extends MutableQuerySet<infer TModel>
            ? ReadonlyArray<IdOrModelLike<TModel>>
            : TRFields[P] extends Serializable
            ? TFields[P]
            : TRFields[P] extends Model<infer TModelClass>
            ? P extends DescriptorKeys<M, OneToOne>
                ? IdOrModelLike<InstanceType<TModelClass>>
                : never
            : never
    }[K]
};

export type CreateProps<M extends Model> = Optional<
    CreatePropsWithDefaults<M>,
    DescriptorKeys<M, AttributeWithDefault>
>;

export type UpsertProps<M extends Model> = Optional<CreateProps<M>, SetDifference<keyof CreateProps<M>, IdKey<M>>>;

export type UpdateProps<M extends Model> = Omit<UpsertProps<M>, IdKey<M>>;

export type LookupProps<M extends Model> = { (row: Ref<M>): boolean } | Partial<Ref<M>>;

export type CustomInstanceProps<M extends Model, Props = object, ExtraProps = Omit<Props, keyof ModelFields<M>>> = {
    [K in keyof ExtraProps]: { [P in K]: ExtraProps[P] extends Serializable ? ExtraProps[P] : never }[K]
};

export interface ModelType<M extends Model> extends QuerySet<M> {
    idExists(id: IdType<M>): boolean;
    withId(id: IdType<M>): SessionBoundModel<M> | null;
    get<TProps extends LookupProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>> | null;
    create<TProps extends CreateProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
    upsert<TProps extends UpsertProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
}

export type IdOrModelLike<M extends Model> = IdType<M> | Record<IdKey<M>, IdType<M>>;
