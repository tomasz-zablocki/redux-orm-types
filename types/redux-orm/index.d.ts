// Type definitions for redux-orm 0.13
// Project: https://github.com/redux-orm/redux-orm
// Definitions by: Andrey Goncharov <https://github.com/keenondrums>
//                 Tomasz Zabłocki <https://github.com/tomasz-zablocki>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.4

import { ORM, ORMOpts, OrmState, SessionType } from './ORM';
import Model, {
    CreateProps,
    CustomInstanceProps,
    IdKey,
    IdOrModelLike,
    IdType,
    ModelField,
    ModelFieldMap,
    ModelOptions,
    ModelType,
    Ref,
    RefPropOrSimple,
    SessionBoundModel,
    UpdateProps,
    UpsertProps
} from './Model';
import QuerySet, {
    LookupPredicate,
    LookupProps,
    LookupResult,
    LookupSpec,
    MutableQuerySet,
    SortIteratee,
    SortOrder
} from './QuerySet';
import Session from './Session';
import { createDatabase, TableState } from './db';
import {
    attr,
    Attribute,
    FieldSpecMap,
    fk,
    ForeignKey,
    many,
    ManyToMany,
    OneToOne,
    oneToOne,
    VirtualFieldSpecMap
} from './fields';
import { createReducer, createSelector, defaultUpdater, ORMReducer, ORMSelector } from './redux';

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
};

export default Model;
