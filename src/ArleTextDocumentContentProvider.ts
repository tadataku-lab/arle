"use strict";

import {TextDocumentContentProvider, Uri, CancellationToken, window, EventEmitter, Event} from 'vscode';
import * as child_process from 'child_process';

export class ArleTextDocumentContentProvider implements TextDocumentContentProvider{
    private _uri: Uri;
    public text: string;
    private _onDidChange = new EventEmitter<Uri>();
    private serverPort: number;

    public set SeverPort(value: number){
        this.serverPort = value;
    }

    public provideTextDocumentContent(uri: Uri, token: CancellationToken):Thenable<string>{
        this._uri = uri;
        return this.generateArleOutput();
    }

    private generateArleOutput():Promise<string>{
        const htmlContent = `
        <head> <style type="text/css"> html, body{ height:100%; width:100%; } </style>
        <script type="text/javascript">
            function start(){
                console.log('arle output');
                var color = '';
                var fontFamily = '';
                var fontSize = '';
                var theme = '';
                var fontWeight = '';
                try {
                    computedStyle = window.getComputedStyle(document.body);
                    color = computedStyle.color + '';
                    backgroundColor = computedStyle.backgroundColor + '';
                    fontFamily = computedStyle.fontFamily;
                    fontSize = computedStyle.fontSize;
                    fontWeight = computedStyle.fontWeight;
                    theme = document.body.className;
                }
                catch(ex){
                }
                document.getElementById('myframe').src = 'http://localhost:${this.serverPort}/?theme=' + theme + '&color=' + encodeURIComponent(color) + "&backgroundColor=" + encodeURIComponent(backgroundColor) + "&fontFamily=" + encodeURIComponent(fontFamily) + "&fontWeight=" + encodeURIComponent(fontWeight) + "&fontSize=" + encodeURIComponent(fontSize);
            }
        </script>
        </head>
        <body onload="start()">
        <iframe id="myframe" frameborder="0" style="border: 0px solid transparent;height:100%;width:100%;" src = "" seamless>
        </iframe>
        </body>`;
        return Promise.resolve(htmlContent);
    }

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    public dispose(){
    }

}