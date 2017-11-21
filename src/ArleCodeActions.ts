
"use strict";

import {CodeActionProvider, TextDocument, Range, CodeActionContext, CancellationToken, Command} from 'vscode';

import { ArleSystem} from './ArleSystem';

export class ArleCodeActions implements CodeActionProvider {

	private arleSysytem: ArleSystem;

	constructor(_arleSystem){
		this.arleSysytem = _arleSystem;
	}

    public provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Thenable<Command[]> {
        let promises = context.diagnostics.map(diag => {
			if (diag.message.indexOf('Arle: ') === 0) {
                let [_, envision] = /^Arle: (.+)/.exec(diag.message);
                let obj = this.arleSysytem.listFunction(envision);
                let command = [];
			    Object.keys(obj).forEach(
						function(funcname){
							command.push({
								title: 'write "' + funcname + '"',
								command: 'change.text',
								arguments: [this[funcname], diag.range]
							});
                        },obj);
                return command;
			}
			return [];
        });
        
        return Promise.all(promises).then(arrs => {
			let results = {};
			for (let segment of arrs) {
                for(let item of segment){
                    results[item.title] = item;
                }
			}
			let ret = [];
			for (let title of Object.keys(results).sort()) {
				ret.push(results[title]);
			}
			return ret;
		});
    }      
}