export class Field {
    readonly index: boolean;
}

export interface AttributeOpts {
    getDefault?: () => any;
}

export class Attribute extends Field {
    constructor(opts?: AttributeOpts);
    ['type']: 'attr';
}

export interface AttributeWithDefault extends Attribute {
    getDefault(): any;
}

export interface RelationalFieldOpts {
    to: string;
    relatedName?: string;
    through?: string;
    throughFields?: [string, string];
    as?: string;
}

export class RelationalField extends Field {
    constructor(toModelName: string, relatedName?: string);
    constructor(opts: RelationalFieldOpts);
}

export class OneToOne extends RelationalField {
    ['type']: 'oneToOne';
}

export class ForeignKey extends RelationalField {
    readonly index: true;
    ['type']: 'fk';
}

export class ManyToMany extends RelationalField {
    readonly index: false;
    ['type']: 'many';
}

export function attr(opts: AttributeOpts): AttributeWithDefault;
export function attr(): Attribute;

export function fk(toModelName: string, relatedName?: string): ForeignKey;
export function fk(opts: RelationalFieldOpts): ForeignKey;

export function many(toModelName: string, relatedName?: string): ManyToMany;
export function many(opts: RelationalFieldOpts): ManyToMany;

export function oneToOne(toModelName: string, relatedName?: string): OneToOne;
export function oneToOne(opts: RelationalFieldOpts): OneToOne;
