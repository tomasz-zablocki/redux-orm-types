import Model, { IdOrModelLike, Serializable } from './Model';
import { ORM } from './ORM';

export interface FieldInstallerOpts {
    field: Field;
    fieldName: string;
    model: typeof Model;
    orm: ORM;
}

export class FieldInstallerTemplate {
    readonly backwardsFieldName: string;
    readonly toModel: typeof Model;
    readonly throughModel: typeof Model;
    constructor(opts: FieldInstallerOpts);
    run(): void;
}

export class DefaultFieldInstaller extends FieldInstallerTemplate {
    installBackwardsDescriptor(): void;
    installBackwardsVirtualField(): void;
    installForwardsDescriptor(): void;
    installForwardsVirtualField(): void;
}

export class Field {
    readonly installsForwardsDescriptor: boolean;
    readonly installsForwardsVirtualField: boolean;
    readonly installsBackwardsDescriptor: boolean;
    readonly installsBackwardsVirtualField: boolean;
    readonly installerClass: typeof DefaultFieldInstaller;
    index: boolean;
    getClass(): typeof Field;
    references(model: typeof Model): boolean;
    getThroughModelName(fieldName: string, model: typeof Model): string;
    createForwardsDescriptor(fieldName: string, model?: typeof Model, toModel?: typeof Model,
                             throughModel?: typeof Model): PropertyDescriptor;
}

export interface AttributeOpts {
    getDefault?: () => any;
}

export class Attribute extends Field {
    constructor(opts?: AttributeOpts)
}

export interface RelationalFieldOpts {
    to: string;
    relatedName?: string;
    through?: string;
    throughFields?: {
        to: string;
        from: string;
    };
    as?: string;
}

export class RelationalField extends Field {
    constructor(toModelName: string, relatedName?: string);
    constructor(opts: RelationalFieldOpts);
    createBackwardsDescriptor(fieldName: string, model?: typeof Model, toModel?: typeof Model,
                              throughModel?: typeof Model): PropertyDescriptor;
}

export class ForeignKey extends RelationalField {
}

export class ManyToMany extends RelationalField {
    getDefault(): ReadonlyArray<IdOrModelLike<any>>;
}

export class OneToOne extends RelationalField {
}

export function attr<T extends AttributeOpts>(opts?: T): {} extends T ? Attribute : AttributeWithDefault;

export function fk(toModelName: string, relatedName?: string): ForeignKey;
export function fk(opts: RelationalFieldOpts): ForeignKey;

export function many(toModelName: string, relatedName?: string): ManyToMany;
export function many(opts: RelationalFieldOpts): ManyToMany;

export function oneToOne(toModelName: string, relatedName?: string): OneToOne;
export function oneToOne(opts: RelationalFieldOpts): OneToOne;

export interface AttributeWithDefault extends Attribute {
    getDefault(): Serializable;
}
