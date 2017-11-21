import * as io from 'socket.io';
import * as http from 'http';
import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import { EventEmitter} from 'events';
import {Express, Request, Response}from 'express';
import * as vscode from 'vscode';

export class Server extends EventEmitter{
    private server: io.Server;
    private app: Express;
    private httpServer: http.Server;
    private port: number;
    private clients: io.socket[] = [];
    private buffer: any[] = [];

    constructor(){
        super();
    }

    public dispose(){
        this.app = null;
        this.port = null;
        if(this.httpServer){
            this.httpServer.close();
            this.httpServer = null;
        }
        if(this.server){
            this.server.close();
            this.server = null;
        }
    }

    public initServer(): number {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.server = io(this.httpServer);

        //this.app.use(express.static('../browser/test.html'));

        let rootDirectory = path.join(__dirname, '..', '..', 'browser');

        this.app.use(express.static(rootDirectory));

        this.app.use(cors());

        /*
        this.app.get('/', (req, res, next) => {
            this.rootRequestHandler(req, res);
        })
        */

        /*
        this.app.get('/', function (req, res, next) {
            res.sendFile(path.join(rootDirectory, 'test.html'));
        });
        */

        /*
        this.httpServer.listen(0,() => {
            this.port = this.httpServer.address().port;
        });
        */
    
        this.httpServer.listen(0);
        this.port = this.httpServer.address().port;

        this.server.on('connection', this.onSocketConnection.bind(this));
        /*
        const server = http.createServer(
            (request: http.IncomingMessage, response: http.ServerResponse) =>
                this.requestHandler(request, response));
        server.listen('5000');
        */

        console.log(this.port);
        return this.port;
    }

    private nl2br(str) {
        str = str.replace(/\r\n/g, "<br />");
        str = str.replace(/(\n|\r)/g, "<br />");
        return str;
    }

    public test(text: string){
        //console.log(this.nl2br(text));
        this.server.emit('appendResults', this.nl2br(text));
    }

    /*
    public rootRequestHandler(req: Request, res: Response) {
        let theme: string = req.query.theme;
        let backgroundColor: string = req.query.backgroundcolor;
        let color: string = req.query.color;
        let editorConfig = vscode.workspace.getConfiguration('editor');
        let fontFamily = editorConfig.get<string>('fontFamily').split('\'').join('').split('"').join('');
        let fontSize = editorConfig.get<number>('fontSize') + 'px';
        let fontWeight = editorConfig.get<string>('fontWeight');
        res.render(path.join(__dirname, '..', '..', 'browser', "index.ejs"),
            {
                theme: theme,
                backgroundColor: backgroundColor,
                color: color,
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight
            }
        );
    }
    */

    private onSocketConnection(socket: io.socket){
        this.clients.push(socket);
        socket.on('appendResults', (data: any) => {
            this.server.emit('appendResults', data);
        });
        socket.on( 'c2s_message', function( data ) {
            // サーバーからクライアントへ メッセージを送り返し
            this.server.emit( 's2c_message', { value : data.value } );
        });
        // クライアントからサーバーへ メッセージ送信ハンドラ（自分以外の全員宛に送る）
        socket.on( 'c2s_broadcast', function( data ) {
            // サーバーからクライアントへ メッセージを送り返し
            socket.broadcast.emit( 's2c_message', { value : data.value } );
        });
        this.emit('connected');
        socket.emit('results', this.buffer);

    }

    /*
    private requestHandler(request: http.IncomingMessage,
                             response: http.ServerResponse): void {
        response.end('Call From ServeAPI Class');
    }
    */
    
}