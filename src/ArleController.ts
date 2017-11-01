
import * as vscode from 'vscode';
import {ArleSystem} from './ArleSystem';

export class ArleController {

    private _disposable: vscode.Disposable;
    private _arleSystem: ArleSystem;

    constructor(arleSystem: ArleSystem) {
        this._arleSystem = arleSystem;
        this._arleSystem.check_code();

        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this._onEvent, this, subscriptions);

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._arleSystem.check_code();
    }

}