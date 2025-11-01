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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintoraAPI = void 0;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class LintoraAPI {
    constructor(context) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('lintora');
        this.baseUrl = config.get('apiUrl') || 'http://localhost:3000/api';
        this.authToken = config.get('authToken') || '';
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return headers;
    }
    async reviewCode(code, language, filename) {
        const config = vscode.workspace.getConfiguration('lintora');
        const analysisTypes = config.get('analysisTypes') || ['security', 'quality'];
        try {
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/review/code`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    code,
                    language,
                    filename,
                    analysisTypes
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Review failed');
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
                throw new Error('Backend not running. Start it with: cd backend && npm run dev');
            }
            throw error;
        }
    }
    async generateCompleteFix(code, language, findings) {
        try {
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/review/complete-fix`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    code,
                    language,
                    findings
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Fix generation failed');
            }
            const result = await response.json();
            return result.fixedCode;
        }
        catch (error) {
            throw error;
        }
    }
    async checkHealth() {
        try {
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/health`);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
}
exports.LintoraAPI = LintoraAPI;
//# sourceMappingURL=api.js.map