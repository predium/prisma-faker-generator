"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genEnum = void 0;
const genEnum = ({ name, values }) => {
    const enumValues = values.map(({ name }) => `${name}="${name}"`).join(',\n');
    return `enum ${name} { \n${enumValues}\n }`;
};
exports.genEnum = genEnum;
//# sourceMappingURL=genEnum.js.map