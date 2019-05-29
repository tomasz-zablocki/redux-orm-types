import QuerySet, { MutableQuerySet, SortIteratee, SortOrder } from './QuerySet';
import { Attribute, AttributeWithDefault, Field, ForeignKey, ManyToMany, OneToOne } from './fields';
import { SessionWithModels } from './Session';

export type Primitive = number | string | boolean;

export type SetDifference<A, B> = A extends B ? never : A;
export type Omit<T, K extends keyof any> = Pick<T, SetDifference<keyof T, K>>;

export type Serializable =
    | Primitive
    | Primitive[]
    | undefined
    | {
          [K: string]: Serializable | Serializable[];
      };

export type ModelField = MutableQuerySet | QuerySet | SessionBoundModel<any> | Serializable;

export interface ModelFieldMap {
    [K: string]: ModelField;
}

export interface ModelOptions<IdKey = any> {
    idAttribute: IdKey;
}

export type FieldDescriptor = Attribute | ForeignKey | ManyToMany | OneToOne;

export type VirtualFieldDescriptor = ForeignKey | ManyToMany | OneToOne;

export interface FieldDescriptorMap {
    [K: string]: FieldDescriptor;
}

export interface VirtualFieldDescriptorMap {
    [K: string]: VirtualFieldDescriptor;
}

export default class Model<MClass extends typeof AnyModel = any, Fields extends ModelFieldMap = any> {
    static readonly modelName: string;
    static readonly fields: FieldDescriptorMap;
    static readonly options: { (): ModelOptions } | ModelOptions;
    static readonly idAttribute: string;
    static readonly querySetClass: typeof QuerySet;
    static readonly virtualFields: VirtualFieldDescriptorMap;
    static readonly query: QuerySet<any>;
    readonly ref: Ref<this>;
    readonly __$infer$__: Fields;

    constructor(props: object);

    static reducer(action: any, modelType: ModelType<any>, session: SessionWithModels<any>): void;
    static all(): QuerySet;
    static create(props: CreateProps<AnyModel>): SessionBoundModel<AnyModel>;
    static upsert(props: UpsertProps<AnyModel>): SessionBoundModel<AnyModel>;
    static get(props: LookupProps<AnyModel>): SessionBoundModel<AnyModel> | undefined;
    static withId(id: IdType<AnyModel>): SessionBoundModel<AnyModel> | null;
    static idExists(id: IdType<AnyModel>): boolean;
    static toString(): string;
    static markAccessed(): void;
    static getQuerySet(): QuerySet;
    static update(props: UpdateProps<AnyModel>): void;
    static at(index: number): SessionBoundModel<AnyModel> | undefined;
    static first(): SessionBoundModel<AnyModel> | undefined;
    static last(): SessionBoundModel<AnyModel> | undefined;
    static filter(props: LookupProps<AnyModel>): QuerySet;
    static exclude(props: LookupProps<AnyModel>): QuerySet;
    static orderBy(
        iteratees: ReadonlyArray<SortIteratee<AnyModel>>,
        orders?: ReadonlyArray<SortOrder>
    ): QuerySet;
    static count(): number;
    static exists(): boolean;
    static delete(): void;

    getClass(): MClass;
    getId(): string | number;
    toString(): string;
    equals(other: AnyModel | SessionBoundModel<any>): boolean;
    set<K extends string>(propertyKey: K, value: RefPropOrSimple<this, K>): void;
    update(props: UpdateProps<this>): void;
    refreshFromState(): void;
    delete(): void;
}

export class AnyModel extends Model {
}

export type ModelClass<M extends Model> = ReturnType<M['getClass']>;

export type FieldDescriptors<M extends Model> = ModelClass<M>['fields'];

export type SessionBoundModelFields<M extends AnyModel> = M['__$infer$__'];

export type IdKey<M extends AnyModel> = ModelClass<M>['options'] extends () => { idAttribute: infer R }
                                        ? R extends string
                                          ? R
                                          : 'id'
                                        : ModelClass<M>['options'] extends { idAttribute: infer R }
                                          ? R extends string
                                            ? R
                                            : 'id'
                                          : 'id';

export type IdType<M extends AnyModel> = IdKey<M> extends infer U
                                         ? U extends keyof SessionBoundModelFields<M>
                                           ? SessionBoundModelFields<M>[U]
                                           : never
                                         : never;

export type DescriptorKeysByValue<M extends Model, TField extends Field, TMDesc = FieldDescriptors<M>> = {
    [K in keyof TMDesc]: TMDesc[K] extends TField ? K : never
}[keyof TMDesc];

export type ManyToManyKeys<M extends AnyModel> = DescriptorKeysByValue<M, ManyToMany>;
export type OneToOneKeys<M extends AnyModel> = DescriptorKeysByValue<M, OneToOne>;
export type AttributesWithGetDefaultKeys<M extends AnyModel> = DescriptorKeysByValue<M, AttributeWithDefault>;

export type RefFields<M extends AnyModel,
    TFields extends SessionBoundModelFields<M> = SessionBoundModelFields<M>,
    FieldKeys extends keyof TFields = keyof TFields,
    DescriptorKeys extends keyof FieldDescriptors<M> = keyof FieldDescriptors<M>> = Pick<TFields, Extract<FieldKeys, Exclude<DescriptorKeys, ManyToManyKeys<M>>>>;

export type Ref<M extends Model> = {
    [K in keyof RefFields<M>]: 'getClass' extends keyof RefFields<M>[K]
                               ? ReturnType<RefFields<M>[K]['getId']>
                               : RefFields<M>[K]
};

export type RefPropOrSimple<M extends Model, K extends string> = K extends keyof RefFields<M> ? M['ref'][K] : Serializable;

export type SessionBoundModel<M extends AnyModel, AdditionalProps extends Record<string, Serializable> = {}> = {
                                                                                                                   getClass(): ModelClass<M>;
                                                                                                                   getId(): IdType<M>;
                                                                                                                   toString(): string;
                                                                                                                   equals(otherModel: SessionBoundModel<any>): boolean;
                                                                                                                   set<K extends string>(propertyKey: K,
                                                                                                                                         value: RefPropOrSimple<M, K>): void;
                                                                                                                   ref: M['ref'];
                                                                                                                   update(props: UpdateProps<M>): void;
                                                                                                                   refreshFromState(): void;
                                                                                                                   delete(): void;
                                                                                                               } & SessionBoundModelFields<M> & AdditionalProps;

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateProps<M extends AnyModel,
    TFields = SessionBoundModelFields<M>,
    TRFields extends Record<keyof TFields, any> = Required<TFields>> = Optional<{
    [K in keyof TFields]: {
        [P in K]: TRFields[P] extends MutableQuerySet<infer TModel>
                  ? ReadonlyArray<IdOrModelLike<TModel>>
                  : TRFields[P] extends Serializable
                    ? TFields[P]
                    : TRFields[P] extends SessionBoundModel<infer TModel>
                      ? P extends OneToOneKeys<M>
                        ? IdOrModelLike<TModel>
                        : never
                      : never
    }[K]
},
    AttributesWithGetDefaultKeys<M>>;

export type UpsertProps<M extends AnyModel> = Optional<CreateProps<M>, SetDifference<keyof CreateProps<M>, IdKey<M>>>;

export type UpdateProps<M extends AnyModel> = Omit<UpsertProps<M>, IdKey<M>>;

export type LookupProps<M extends AnyModel> = Partial<Ref<M>>;

export type CustomInstanceProps<M extends AnyModel, Props = {}, ExtraProps = Omit<Props, keyof SessionBoundModelFields<M>>> = {
    [K in keyof ExtraProps]: { [P in K]: ExtraProps[P] extends Serializable ? ExtraProps[P] : never }[K]
};

export interface ModelType<M extends Model> {
    readonly modelName: ModelClass<M>['modelName'];
    readonly idAttribute: IdKey<M>;
    readonly query: QuerySet<M>;

    all(): QuerySet<M>;
    idExists(id: IdType<M>): boolean;
    withId(id: IdType<M>): SessionBoundModel<M> | null;
    get(props: LookupProps<M>): SessionBoundModel<M>;
    create<TProps extends CreateProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
    upsert<TProps extends UpsertProps<M>>(props: TProps): SessionBoundModel<M, CustomInstanceProps<M, TProps>>;
    toString(): string;
    at(index: number): SessionBoundModel<M> | undefined;
    first(): SessionBoundModel<M> | undefined;
    last(): SessionBoundModel<M> | undefined;
    filter(props: LookupProps<M>): QuerySet<M>;
    exclude(props: LookupProps<M>): QuerySet<M>;
    orderBy(iteratees: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;
    count(): number;
    exists(): boolean;
    updateT(props: object & UpdateProps<M>): void;
    delete(): void;
}

export type IdOrModelLike<M extends Model> = IdType<M> | Record<IdKey<M>, IdType<M>>;
