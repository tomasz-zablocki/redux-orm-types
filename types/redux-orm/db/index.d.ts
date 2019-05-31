import createDatabase = require('./Database');

export * from './Database';
export { TableProps, TableSpec, TableOpts, TableState, Table } from './Table';
export default createDatabase;
