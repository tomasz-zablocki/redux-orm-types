/** Primitive value */
export type Primitive = (number | string | boolean | undefined) | Array<number | string | boolean | undefined>;

/** Plain JS object */
export interface PlainObject {
    [K: string]: Serializable;
}

/** Serializable value: a {@link Primitive}, a {@link PlainObject} or an `Array<PlainObject>` */
export type Serializable = Primitive | PlainObject | PlainObject[];

export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]: T[Key] extends ValueType ? Key : never }[keyof T]>;

export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
