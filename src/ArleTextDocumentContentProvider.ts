"use strict";

import {TextDocumentContentProvider, Uri, CancellationToken, window, EventEmitter, Event} from 'vscode';
import * as child_process from 'child_process';

export class ArleTextDocumentContentProvider implements TextDocumentContentProvider{
    private _uri: Uri;
    public text: string;
    private _onDidChange = new EventEmitter<Uri>();

    public provideTextDocumentContent(uri: Uri, token: CancellationToken):Thenable<string>{
        this._uri = uri;
        return this.generateArleOutput();
    }

    private generateArleOutput():Promise<string>{
        /*
        const htmlContent = this.origamiRun().then(text => {
            return `
            <body>
            ${text}
            </body>`;
        });
        */
        const htmlContent = `
        <body>
        ${this.text}
        </body>`;
        
        return Promise.resolve(htmlContent);
    }

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    private origamiRun(): Promise<string>{
        let origamiCommand = 'origami konoha ';
        let doc = window.activeTextEditor.document;
        let pass = doc.uri.path;
        let p = child_process.exec(origamiCommand + pass, (error, stdout, stderror) => {});
        let output = Promise.resolve('test').then( buf =>{
            let end = true;
            p.stdout.on('data', function(data) {
                console.log(data);
                buf += data.toString();
                let index = buf.indexOf('\n');
                let interpreterIndex = buf.indexOf('Konoha🍃');
                if(index > -1 && interpreterIndex == -1){
                    buf += buf;
                }
            });
            p.stdout.on('end', () => {
                console.log(buf);
                end = false;
            })
            return buf;
        });
        return output
    }

    public dispose(){
    }

}