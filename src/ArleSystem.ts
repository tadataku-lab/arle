"use strict";

import {TextDocument, Diagnostic, DiagnosticSeverity, DiagnosticCollection, languages, Range, Position, window} from 'vscode';
import * as child_process from 'child_process';


export class ArleSystem{
    private doc;
    private uri;
    private _diagnosticCollection;
    private diagnostics;
    private defFunc = [];

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
        if (!editor) {
            return;
        }
        this.doc = editor.document;
        this.uri = this.doc.uri;
        let lines = this.doc.getText().split(/\r?\n/g);
        let _defFunc = [];
        lines.forEach((line, i) => {
            let result = line.match(/\(\((.+)\)\)/);
            if (result) {
                let index = line.indexOf(result[0]);
                if (index >= 0) {
                    this.ArleDiagnostic(result[1], new Range(new Position(i, index), new Position(i, result[0].length + index)));
                }
            }
            //let func = line.match(/def\s+(\w+)\s+\((,)+\)/);
        let func = line.match(/def\s+(\w+)\s*\((.+)\)(?:(?::|->)\s*((?:Int|Float|Bool)(?:\[\])?))?/);
            if (func) {
                let _args = [];
                let _ret  = 'Void';
                if(func.length >= 2){
                    let args = func[2].match(/((?:Int|Float|Bool)(?:\[\])?)/g);
                    if(args){
                        for (let arg of args){
                            _args.push(arg);
                        } 
                    }
                    if(func.length == 2){
                        _ret = 'Void';
                    }else{
                        _ret = func[3];
                    }
                    //arg_num = (func[2].match(/,/g)||[]).length + 1;
                };
                _defFunc.push({
                    name: func[1],
                    args: _args,
                    ret: _ret
                });
            }
        });
        this.defFunc = _defFunc;
        //console.log(_defFunc);
    }

    public listFunction(envision: string): {}{

        // aruru command execute
        let functions = {};
        let envisionInfo = {
            argValue: [],
            argType: [],
            returnValue: null,
            returnType: null
        };
        let _envision = envision.match(/[A-Za-z0-9_\[\]]+(?:\s*:\s*((?:Int|Float|Bool)(?:\[\])?))?/g);
        //console.log(_envision);
        if (_envision != null) {
            let args = '';
            let return_value = '';
            _envision.forEach((arg, i) => {
                if(i != _envision.length - 1){
                    if(arg.indexOf(':') == -1){
                        let type = arg.match(/((?:Int|Float|Bool)(?:\[\])?)/);
                        if(type == null){
                            envisionInfo.argValue.push(arg);
                            envisionInfo.argType.push(null);
                        }else{
                            envisionInfo.argValue.push(null);
                            envisionInfo.argType.push(type[1]);
                        }
                    }else{
                        let buf = arg.match(/([A-Za-z0-9_\[\]]+)(?:\s*:\s*((?:Int|Float|Bool)(?:\[\])?))/);
                        envisionInfo.argValue.push(buf[1]);
                        envisionInfo.argType.push(buf[2]);
                    }
                }else{
                    if(arg.indexOf(':') == -1){
                        let type = arg.match(/((?:Int|Float|Bool)(?:\[\])?)/);
                        if(type == null){
                            envisionInfo.returnValue = arg;
                        }else{
                            envisionInfo.returnType = type[1];
                        }
                    }else{
                        let buf = arg.match(/([A-Za-z0-9_\[\]]+)(?:\s*:\s*((?:Int|Float|Bool)(?:\[\])?))/);
                        envisionInfo.returnValue = buf[1];
                        envisionInfo.returnType = buf[2];
                    }
                }
            });
            //console.log(envisionInfo);
            
            this.defFunc.forEach((funcInfo) =>{
                if(funcInfo.args.length == envisionInfo.argType.length){
                    let flag = true;
                    funcInfo.args.forEach((argType, i) => {
                        if(envisionInfo.argType[i] != argType && envisionInfo.argType != null){
                            flag = false;
                        }
                    });
                    if(envisionInfo.returnType != funcInfo.ret && envisionInfo.returnType != null) flag = false;
                    if(flag){
                        let returnValue = '';
                        let argsValue = '';
                        if(envisionInfo.returnValue != null){
                            returnValue = ' == ' + envisionInfo.returnValue;
                        }else if(envisionInfo.returnType != null){
                            returnValue = ' == ' + envisionInfo.returnType;
                        }
                        envisionInfo.argValue.forEach((value, i) => {
                            if(i != 0){
                                argsValue = argsValue + ', ';
                            }
                            if(value == null){
                                argsValue = argsValue + envisionInfo.argType[i];
                            }else{
                                argsValue = argsValue + value;
                            }
                        });
                        functions[funcInfo.name] = funcInfo.name + '(' + argsValue + ')' + returnValue;
                    }
                }
            });
        }
        return functions;
        
    }

    /*
    public listFunction(envision: string): {}{
        let origamiCommand = 'origami konoha ';

        // aruru command execute
        let functions = {};
        let _envision = envision.match(/(\w+)/g);
        if (_envision != null) {
            let args = '';
            let return_value = '';
            _envision.forEach((value, i) => {
                if(i != _envision.length - 1){
                    if(i == 0){
                        args = args + value;
                    }else{
                        args = args + ',' + value; 
                    }
                }else{
                    return_value = value;
                }
            });
            
            let p = child_process.exec(origamiCommand + this.uri.pass, (error, stdout, stderror) => {});
            
            let buf = ``;
            let put = false;

            p.on('exit', function (code) {
                //console.log('child process exited.');
            });
                    
            p.stdout.on('data', function(data) {
                //console.log(buf);
                buf += data.toString();
                let index = buf.indexOf('\n');
                let interpreterIndex = buf.indexOf('Konoha🍃');
                if(index > -1 && interpreterIndex == -1){
                    //console.log(buf);
                    if(buf.indexOf('(Bool) true') != -1) put = true;
                    buf = '';
                }
            });
            
            this.defFunc.forEach((funcInfo) =>{
                if(funcInfo.arg_num == _envision.length - 1){

                    
                    
                    let promise = function(): Promise<any> {
                        return new Promise(function(resolve, reject) {
                        console.log('aruru');
                        let write = function(): Promise<any>{
                            return new Promise(function(){
                                console.log('aru');
                                p.stdin.on('data', function(data) {
                                    buf += data.toString();
                                    console.log(buf);
                                    let index = buf.indexOf('\n');
                                    let interpreterIndex = buf.indexOf('Konoha🍃');
                                    if(index > -1 && interpreterIndex == -1){
                                        console.log(buf);
                                        if(buf.indexOf('(Bool) true') != -1) put = true;
                                        buf = '';
                                    }
                                });
                                console.log(p.stdin.write(funcInfo.name + '(' + args + ') == ' + return_value + '\n'));
                                p.stdin.end();
                            });
                        }
                        write().then();
                        if(put == true){
                            functions[funcInfo.name] = funcInfo.name + '()';
                            put = false;
                        }
                    });
                    }

                    promise().then();

                    
                    
                    functions[funcInfo.name] = funcInfo.name + '()';
                }
            });
            p.kill();
        }
        return functions;
        
    }
    */

}

