// Type definitions for redux-orm 0.13
// Project: https://github.com/redux-orm/redux-orm
// Definitions by: Andrey Goncharov <https://github.com/keenondrums>
//                 Tomasz Zabłocki <https://github.com/tomasz-zablocki>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.4

import { SessionType, ORM, ORMOpts, OrmState } from './ORM';
import Model, {
    IdOrModelLike,
    Ref,
    SessionBoundModel,
    IdKey,
    IdType,
    ModelType,
    ModelOptions,
    RefPropOrSimple,
    ModelFieldMap,
    CustomInstanceProps,
    UpsertProps,
    CreateProps,
    UpdateProps,
    ModelField
} from './Model';
import QuerySet, {
    LookupResult,
    LookupSpec,
    LookupPredicate,
    LookupProps,
    SortIteratee,
    SortOrder,
    MutableQuerySet
} from './QuerySet';
import Session from './Session';
import { TableState, createDatabase } from './db';
import {
    Attribute,
    VirtualFieldSpecMap,
    FieldSpecMap,
    OneToOne,
    ForeignKey,
    ManyToMany,
    attr,
    oneToOne,
    fk,
    many
} from './fields';
import { createSelector, createReducer, defaultUpdater, ORMReducer, ORMSelector } from './redux';

export {
    VirtualFieldSpecMap,
    FieldSpecMap,
    LookupResult,
    LookupSpec,
    LookupPredicate,
    LookupProps,
    ModelOptions,
    RefPropOrSimple,
    ModelFieldMap,
    CustomInstanceProps,
    UpsertProps,
    CreateProps,
    UpdateProps,
    ModelField,
    SortIteratee,
    SortOrder,
    MutableQuerySet,
    createDatabase,
    createSelector,
    createReducer,
    defaultUpdater,
    ORMSelector,
    ORMReducer,
    IdOrModelLike,
    Ref,
    SessionBoundModel,
    IdKey,
    IdType,
    ModelType,
    ORM,
    OrmState,
    ORMOpts,
    Session,
    TableState,
    SessionType,
    Model,
    QuerySet,
    Attribute,
    OneToOne,
    ForeignKey,
    ManyToMany,
    attr,
    oneToOne,
    fk,
    many
}

export default Model;
