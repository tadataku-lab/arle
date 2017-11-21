import * as child_process from 'child_process';
import * as vscode from 'vscode';

export function sandbox() :Promise<any>{
    console.log('hello');

    let exe = new Promise(function(){
        
        let origamiCommand = 'origami konoha ';
    
        let editor = vscode.window.activeTextEditor;
    
        let textData = editor.document;
        let pass = textData.uri.path;
        
        let spawn = child_process.spawn;

        let p = spawn(origamiCommand + pass);
        //let p = spawn('ls');
        
        let buf = ``;
    
        p.stdout.on('data', function(data) {
            buf += data.toString();
            let index = buf.indexOf('\n');
            let interpreterIndex = buf.indexOf('Konoha🍃');
            if(index > -1 && interpreterIndex == -1){
                console.log(buf);
                buf = '';
            }
        });

        p.on('exit', function(){
            console.log('child process exited.');
          });

        console.log('1 + 1:'+ p.stdin.write('1 + 1\n'));

        p.kill();

    });

    
    return exe;
}