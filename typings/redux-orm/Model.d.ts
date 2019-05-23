import QuerySet, { MutableQuerySet, SortIteratee, SortOrder } from './QuerySet';
import { Attribute, AttributeWithDefault, Field, ForeignKey, ManyToMany, OneToOne } from './fields';
import { SessionWithModels } from './Session';

export type Primitive = number | string | boolean;
/**
 * Credits to all the people who given inspiration and shared some very useful code snippets
 * in the following github issue: https://github.com/Microsoft/TypeScript/issues/12215
 */
/**
 * Primitive
 * @desc Type representing primitive types in TypeScript: `number | boolean | string | symbol`
 * @example
 *   type Various = number | boolean | string | symbol | object;
 *
 *    // Expect: object
 *   Exclude<Various, Primitive>
 */
/**
 * Falsey
 * @desc Type representing falsey values in TypeScript: `null | undefined | false | 0 | ''`
 * @example
 *   type Various = 'a' | 'b' | undefined | false;
 *
 *   // Expect: "a" | "b"
 *   Exclude<Various, Falsey>;
 */
/**
 * SetIntersection (same as Extract)
 * @desc Set intersection of given union types `A` and `B`
 * @example
 *   // Expect: "2" | "3"
 *   SetIntersection<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: () => void
 *   SetIntersection<string | number | (() => void), Function>;SetDifference (same as Exclude)
 * @desc Set difference of given union types `A` and `B`
 * @example
 *   // Expect: "1"
 *   SetDifference<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: string | number
 *   SetDifference<string | number | (() => void), Function>;
 */
export declare type SetDifference<A, B> = A extends B ? never : A;
export declare type Omit<T, K extends keyof any> = Pick<T, SetDifference<keyof T, K>>;

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

export type FieldDescriptorMap = { [K: string]: FieldDescriptor };

export type VirtualFieldDescriptorMap = { [K: string]: VirtualFieldDescriptor };

export default class Model<MClass extends typeof AnyModel = any, Fields extends ModelFieldMap = any> {
    static readonly modelName: string;
    static readonly fields: FieldDescriptorMap;
    static readonly options: { (): ModelOptions<any> } | ModelOptions<any>;
    static readonly idAttribute: string;
    static readonly querySetClass: typeof QuerySet;
    static readonly virtualFields: VirtualFieldDescriptorMap;
    static readonly query: QuerySet<any>;
    readonly ref: Ref<this>;
    readonly __$infer$__: Fields;

    constructor(props: object);

    static reducer<M extends ModelType<any> = ModelType<AnyModel>,
        S extends SessionWithModels<any> = SessionWithModels<[]>>(action: any, modelType: M, session: S): void;
    static all<M extends Model>(): QuerySet<M>;
    static create<M extends Model>(props: CreateProps<M>): SessionBoundModel<M>;
    static upsert<M extends Model>(props: UpsertProps<M>): SessionBoundModel<M>;
    static get<M extends Model>(props: LookupProps<M>): SessionBoundModel<M> | undefined;
    static withId<M extends Model>(id: IdType<M>): SessionBoundModel<M> | null;
    static idExists<M extends Model>(id: IdType<M>): boolean;
    static toString(): string;
    static markAccessed(): void;
    static getQuerySet<M extends Model>(): QuerySet<M>;
    static update<M extends Model, TProps extends UpdateProps<M>>(props: TProps): void;
    static at<M extends Model>(index: number): SessionBoundModel<M> | undefined;
    static first<M extends Model>(): SessionBoundModel<M> | undefined;
    static last<M extends Model>(): SessionBoundModel<M> | undefined;
    static filter<M extends Model, TProps extends LookupProps<M>>(props: TProps): QuerySet<M>;
    static exclude<M extends Model, TProps extends LookupProps<M>>(LookupProps: TProps): QuerySet<M>;
    static orderBy<M extends Model>(
        iteratees: ReadonlyArray<SortIteratee<M>>,
        orders?: ReadonlyArray<SortOrder>
    ): QuerySet<M>;
    static count<M extends Model>(): number;
    static exists<M extends Model>(): boolean;
    static delete<M extends Model>(): void;

    getClass(): MClass;
    getId(): string | number;
    toString(): string;
    equals(other: AnyModel | SessionBoundModel<any>): boolean;
    set<K extends string, TValue = RefPropOrSimple<this, K>>(propertyKey: K, value: TValue): void;
    update<TProps extends UpdateProps<this>>(props: TProps): void;
    refreshFromState(): void;
    delete(): void;
}

export class AnyModel extends Model<any, any> {
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

type RefPropOrSimple<M extends Model, K extends string> = K extends keyof RefFields<M> ? M['ref'][K] : Serializable;

export type SessionBoundModel<M extends AnyModel> = {
                                                        getClass(): ModelClass<M>;
                                                        getId(): IdType<M>;
                                                        toString(): string;
                                                        equals(otherModel: SessionBoundModel<any>): boolean;
                                                        set<K extends string, TValue = RefPropOrSimple<M, K>>(propertyKey: K,
                                                                                                              value: TValue): void;
                                                        ref: M['ref'];
                                                        update<TProps extends UpdateProps<M>>(props: TProps): void;
                                                        refreshFromState(): void;
                                                        delete(): void;
                                                    } & SessionBoundModelFields<M>;

export declare type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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

export type CustomInstanceProps<M extends AnyModel, Props = object> = Omit<Props, keyof SessionBoundModelFields<M>>;

export interface ModelType<M extends AnyModel> {
    readonly modelName: ModelClass<M>['modelName'];
    readonly idAttribute: IdKey<M>;
    readonly query: QuerySet<M>;

    all(): QuerySet<M>;
    idExists(id: IdType<M>): boolean;
    withId(id: IdType<M>): SessionBoundModel<M> | null;
    get<TProps extends LookupProps<M>>(props: TProps): SessionBoundModel<M>;
    create<TProps extends CreateProps<M>>(props: TProps): SessionBoundModel<M> & CustomInstanceProps<M, TProps>;
    upsert<TProps extends UpsertProps<M>>(props: TProps): SessionBoundModel<M> & CustomInstanceProps<M, TProps>;
    toString(): string;
    at(index: number): SessionBoundModel<M> | undefined;
    first(): SessionBoundModel<M> | undefined;
    last(): SessionBoundModel<M> | undefined;
    filter<TProps extends LookupProps<M>>(props: TProps): QuerySet<M>;
    exclude<TProps extends LookupProps<M>>(LookupProps: TProps): QuerySet<M>;
    orderBy(iteratees: ReadonlyArray<SortIteratee<M>>, orders?: ReadonlyArray<SortOrder>): QuerySet<M>;
    count(): number;
    exists(): boolean;
    update<TProps extends UpdateProps<M>>(props: TProps): void;
    delete(): void;
}

export type IdOrModelLike<M extends Model> = IdType<M> | Record<IdKey<M>, IdType<M>>;
