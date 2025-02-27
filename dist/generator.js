"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_helper_1 = require("@prisma/generator-helper");
const fs = __importStar(require("fs"));
const internals_1 = require("@prisma/internals");
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const generatePrismaFaker_1 = require("./helpers/generatePrismaFaker");
const generatorUtils_1 = require("./helpers/generatorUtils");
const { version } = require('../package.json');
(0, generator_helper_1.generatorHandler)({
    onManifest() {
        internals_1.logger.info(`${constants_1.GENERATOR_NAME}:Registered`);
        return {
            version,
            defaultOutput: '../generated',
            prettyName: constants_1.GENERATOR_NAME,
        };
    },
    onGenerate: async (options) => {
        var _a;
        const faker = (0, generatePrismaFaker_1.generatePrismaFaker)(options.dmmf.datamodel.models, (0, generatorUtils_1.getMapperOptions)(options.generator.config));
        const writeLocation = path_1.default.join((_a = options.generator.output) === null || _a === void 0 ? void 0 : _a.value, 'faker.ts');
        await fs.promises.mkdir(path_1.default.dirname(writeLocation), {
            recursive: true,
        });
        await fs.promises.writeFile(writeLocation, faker);
    },
});
//# sourceMappingURL=generator.js.map