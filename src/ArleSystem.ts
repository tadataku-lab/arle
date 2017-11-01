"use strict";

import {TextDocument, Diagnostic, DiagnosticSeverity, DiagnosticCollection, languages, Range, Position, window} from 'vscode';

export class ArleSystem{
    private doc;
    private uri;
    private _diagnosticCollection;
    private diagnostics;

    constructor(){
        this._diagnosticCollection = languages.createDiagnosticCollection();
        this.diagnostics = [];
    }

    public dispose(){
    }

    private ArleDiagnostic(message: string, range: Range){
        let diagnostic = new Diagnostic(range, 'Arle: ' + message, DiagnosticSeverity.Hint);
        this.diagnostics.push(diagnostic);
        this._diagnosticCollection.set(this.uri, this.diagnostics);
    }

    public check_code(){
        this._diagnosticCollection.clear();
        this.diagnostics = [];
        let editor = window.activeTextEditor;
        this.doc = editor.document;
        this.uri = this.doc.uri;
        let lines = this.doc.getText().split(/\r?\n/g);
        lines.forEach((line, i) => {
            let result = line.match(/\(\((.+)\)\)/);
            if (result != null) {
                let index = line.indexOf(result[0]);
                if (index >= 0) {
                    this.ArleDiagnostic(result[1], new Range(new Position(i, index), new Position(i, result[0].length + index)));
                }
            }
        })
    }

}

export function listFunction(envision: string): {}{
    // aruru command execute
    let functions = {};
    let index = envision.indexOf("Int -> Int -> Int");
    if(index >= 0){
        functions['add'] = 'def add(a,b){ \n\treturn a + b \n}';
        functions['sub'] = 'def sub(a,b){}';
        functions['mul'] = 'def mul(a,b){}';
        functions['div'] = 'def div(a,b){}';
    }
    return functions;
    
}