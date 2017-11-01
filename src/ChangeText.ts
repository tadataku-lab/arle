"use strict";

import {TextDocument,TextEditor, workspace, WorkspaceEdit, Range, Position, Uri} from 'vscode';

export class ChangeText {

    public _doc: TextDocument;
    private _uri: Uri;

    constructor( doc: TextDocument){
        this._doc = doc;
        this._uri = doc.uri;
    }

    public get_line( num: number): string{
        return this._doc.lineAt(num).text;
    }

    public get_text( range: Range): string{
        return this._doc.getText(range);
    }

    public write_string( word: string, range: Range): void{
        let workspaceedit = new WorkspaceEdit();
        workspaceedit.replace(this._uri, range, word);
        workspace.applyEdit(workspaceedit);
    }

}