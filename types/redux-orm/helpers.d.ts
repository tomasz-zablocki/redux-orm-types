/**
 * Credits to Piotr Witek (http://piotrwitek.github.io) and utility-type project (https://github.com/piotrwitek/utility-types)
 */
export type Assign<T extends object, U extends object, I = Diff<T, U> & Intersection<U, T> & Diff<U, T>> = Pick<
    I,
    keyof I
>;

export type Diff<T extends object, U extends object> = Pick<T, Exclude<keyof T, keyof U>>;

export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]: T[Key] extends ValueType ? Key : never }[keyof T]>;

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Intersection<T extends object, U extends object> = Pick<
    T,
    Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>;

export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];

export type HardPick<T extends object, K extends keyof any> = {
    [P in Extract<keyof T, K>]: T[P];
};
export type HardOmit<T extends object, K extends keyof any> = HardPick<T, Exclude<keyof T, K>>;

export type HardOptional<T extends object, K extends keyof any> = Optional<T, Extract<keyof T, K>>;

export type UnBox<T> = undefined extends T
    ? undefined
    : T extends Array<infer U>
    ? U
    : T extends (...args: any[]) => infer U
    ? U
    : T;

export type ObjectAssign<
    Defaults,
    Overrides extends { [K in keyof Defaults]+?: any } | undefined
> = Overrides extends undefined
    ? Defaults
    : {
          [P in keyof Defaults]-?: P extends keyof Overrides ? Overrides[P] : Defaults[P];
      };
