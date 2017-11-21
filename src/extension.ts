'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import {ChangeText} from './ChangeText';
import {ArleSystem} from './ArleSystem';
import {ArleController} from './ArleController';
import {ArleCodeActions} from './ArleCodeActions';
import {ArleTextDocumentContentProvider} from './ArleTextDocumentContentProvider';
import {Server} from './server';
import * as sandbox from './sandbox';

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
    
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(Konoha5_MODE, new ArleCodeActions(arle_system)));

    let server = new Server();
    
    let server_start = vscode.commands.registerCommand('arle.server.start', () => {
        provider.SeverPort = server.initServer();
    });

    let append_message = vscode.commands.registerCommand('arle.push.message', () => {
        server.test("test");
    });

    let outputChannel = vscode.window.createOutputChannel("konoha5");

    let run_konoha5 = vscode.commands.registerCommand('arle.runKonoha5', () => {
        
        vscode.window.showInformationMessage('Konoha5 Run!');

        outputChannel.clear();

        let origamiCommand = 'origami konoha ';

        let editor = vscode.window.activeTextEditor;

        let textData = editor.document;
        let pass = textData.uri.path;
    
        let p = child_process.exec(origamiCommand + pass, (error, stdout, stderror) => {});
    
        let buf = ``;

        p.stdout.on('data', function(data) {
            buf += data.toString();
            let index = buf.indexOf('\n');
            let interpreterIndex = buf.indexOf('Konoha🍃');
            if(index > -1 && interpreterIndex == -1){
                outputChannel.append(buf);
                server.test(buf);
                buf = '';
            }
        });
    });

    //sandbox.sandbox();

    context.subscriptions.push(server);
    context.subscriptions.push(server_start);
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