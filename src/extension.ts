'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {ChangeText} from './ChangeText';
import {ArleSystem} from './ArleSystem';
import {ArleController} from './ArleController';
import {ArleCodeActions} from './ArleCodeActions';
import {ArleTextDocumentContentProvider} from './ArleTextDocumentContentProvider';

const Konoha5_MODE: vscode.DocumentFilter = { language: 'konoha5', scheme: 'file'};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "arle" is now active!');

    let arle_system = new ArleSystem();
    
    let arle_aruaru = vscode.commands.registerCommand('arle.aruaru', () => {
        arle_system.check_code();
    });

    let change_text = vscode.commands.registerCommand('change.text', (text: string, range: vscode.Range) => {
        let editor = vscode.window.activeTextEditor;
        let controller = new ChangeText(editor.document);
        controller.write_string(text, range);
    });
    
    let provider = new ArleTextDocumentContentProvider();

    let registerProvider = vscode.workspace.registerTextDocumentContentProvider('ArleOutput', provider);
    
    let arle_output = vscode.commands.registerCommand('arle.interactive.start', () => {
        let previewUri = vscode.Uri.parse('ArleOutput://authority/ArleOutput');
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'ArleOutput').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });

    let controller = new ArleController(arle_system);
    
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(Konoha5_MODE, new ArleCodeActions()));

    context.subscriptions.push(arle_output);
    context.subscriptions.push(registerProvider);
    context.subscriptions.push(provider);
    context.subscriptions.push(change_text);
    context.subscriptions.push(arle_aruaru);
    context.subscriptions.push(arle_system);
}

// this method is called when your extension is deactivated
export function deactivate() {
}