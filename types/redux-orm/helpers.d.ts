import { AnyModel } from './Model';

export type Primitive = number | string | boolean;
export type Serializable =
    | Primitive
    | Primitive[]
    | undefined
    | {
          [K: string]: Serializable | Serializable[];
      };
export interface SerializableMap {
    [K: string]: Serializable | Serializable[];
}
export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]: T[Key] extends ValueType ? Key : never }[keyof T]>;
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
export type OmitByValue<T, ValueType> = Pick<T, { [Key in keyof T]: T[Key] extends ValueType ? never : Key }[keyof T]>;
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type IndexedModelClasses<
    T extends { [k in keyof T]: typeof AnyModel },
    K extends keyof T = Extract<keyof T, T[keyof T]['modelName']>
> = { [k in K]: T[K] };
