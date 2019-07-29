import { ORM } from './ORM';
import { OrmSession } from './Session';

export interface ORMReducer<S extends ORM.Schema, TAction extends any = any> {
    (state: ORM.State<S> | undefined, action: TAction): ORM.State<S>;
}

export type defaultUpdater<S extends ORM.Schema, TAction extends any = any> = (
    session: OrmSession<S>,
    action: TAction
) => void;

export function createReducer<S extends ORM.Schema, TAction extends any = any>(
    orm: ORM<S>,
    updater?: defaultUpdater<S, TAction>
): ORMReducer<S, TAction>;

export type Selector<S, R> = (state: S) => R;

export interface ORMSelector<S extends ORM.Schema, Args extends any[], R> {
    (session: OrmSession<S>, ...args: Args): R;
}

export function createSelector<S, OSchema extends ORM.Schema, R1, R2, R3, R4, R5, R6, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    selector2: Selector<S, R2>,
    selector3: Selector<S, R3>,
    selector4: Selector<S, R4>,
    selector5: Selector<S, R5>,
    selector6: Selector<S, R6>,
    ormSelector: ORMSelector<OSchema, [R1, R2, R3, R4, R5, R6], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R1, R2, R3, R4, R5, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    selector2: Selector<S, R2>,
    selector3: Selector<S, R3>,
    selector4: Selector<S, R4>,
    selector5: Selector<S, R5>,
    ormSelector: ORMSelector<OSchema, [R1, R2, R3, R4, R5], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R1, R2, R3, R4, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    selector2: Selector<S, R2>,
    selector3: Selector<S, R3>,
    selector4: Selector<S, R4>,
    ormSelector: ORMSelector<OSchema, [R1, R2, R3, R4], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R1, R2, R3, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    selector2: Selector<S, R2>,
    selector3: Selector<S, R3>,
    ormSelector: ORMSelector<OSchema, [R1, R2, R3], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R1, R2, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    selector2: Selector<S, R2>,
    ormSelector: ORMSelector<OSchema, [R1, R2], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R1, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    selector1: Selector<S, R1>,
    ormSelector: ORMSelector<OSchema, [R1], R>
): Selector<S, R>;

export function createSelector<S, OSchema extends ORM.Schema, R>(
    orm: ORM<OSchema>,
    OrmStateSelector: Selector<S, ORM.State<OSchema>>,
    ormSelector: ORMSelector<OSchema, [], R>
): Selector<S, R>;

export function createSelector<OSchema extends ORM.Schema, R>(orm: ORM<OSchema>, ormSelector: ORMSelector<OSchema, [], R>): Selector<ORM.State<OSchema>, R>;
