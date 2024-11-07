"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor() {
        this.query = { selector: {} };
        this.params = {};
        this.fieldsUsed = [];
    }
    // Define "where" with operators like =, !=, >, <, >=, <=
    where(queryStr, value) {
        const [field, operator, param] = queryStr.split(" ");
        if (!field || !operator || !param) {
            throw new Error('Invalid query string format. Must be "field operator value".');
        }
        this.query.selector[field] = { [operator]: value };
        this.params[field] = value; // Add value to parameters
        this.fieldsUsed.push(field);
        return this;
    }
    // Define "andWhere" to add additional conditions with operators
    andWhere(queryStr, value) {
        const [field, operator, param] = queryStr.split(" ");
        if (!field || !operator || !param) {
            throw new Error('Invalid query string format. Must be "field operator value".');
        }
        this.query.selector[field] = { [operator]: value };
        this.params[field] = value;
        this.fieldsUsed.push(field);
        return this;
    }
    // Define "orWhere" to add OR conditions
    orWhere(queryStr, value) {
        const [field, operator, param] = queryStr.split(" ");
        if (!field || !operator || !param) {
            throw new Error('Invalid query string format. Must be "field operator value".');
        }
        this.query.selector[field] = { [operator]: value };
        this.params[field] = value;
        this.fieldsUsed.push(field);
        return this;
    }
    // Executes the query and returns a single document
    findOne(connection, views) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const viewName = `by${this.fieldsUsed.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('')}`;
            // Attempt to find a view in CouchDB with the constructed name
            if ((_a = views["user"]) === null || _a === void 0 ? void 0 : _a.includes(viewName)) {
                // If view exists, use it
                const keys = this.fieldsUsed.map(field => this.query.selector[field]["$eq"]);
                const res = yield connection.view("user", viewName, { keys });
                return res.rows.length > 0 ? res.rows[0].value : null;
            }
            else {
                // Fall back to Mango query if no view matches
                const res = yield connection.find(this.query);
                return res.docs.length > 0 ? res.docs[0] : null;
            }
        });
    }
    // Executes the query and returns multiple documents
    findMany(connection, views) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const viewName = `by${this.fieldsUsed.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('')}`;
            // Attempt to find a view in CouchDB with the constructed name
            if ((_a = views["user"]) === null || _a === void 0 ? void 0 : _a.includes(viewName)) {
                // If view exists, use it
                const keys = this.fieldsUsed.map(field => this.query.selector[field]["$eq"]);
                const res = yield connection.view("user", viewName, { keys });
                return res.rows.length > 0 ? res.rows.map(row => row.value) : [];
            }
            else {
                // Fall back to Mango query if no view matches
                const res = yield connection.find(this.query);
                return res.docs.length > 0 ? res.docs : [];
            }
        });
    }
}
