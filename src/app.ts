import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import logger from 'morgan';
import socketIO from 'socket.io';

const app = express();

interface Error {
  status?: number;
  message?: string;
}

// middleware
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../src/static')));

// index
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, '../src/static', 'index.html'));
});

// error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('404errrrrrr');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).send('500errrrrrrr');
});

// server
const options = {
  host: process.env.NODE_HOST || 'localhost',
  port: process.env.NODE_PORT || 3001,
};

const server = app.listen(options, () =>
  console.log(`server on!!! ${options.host}:${options.port}`)
);

// socket.io
const io: any = socketIO(server);

io.sockets.on('connection', (socket: any) => {
  console.log('접속');

  socket.on('newUser', (name: string) => {
    console.log('name : ', `${name}님 접속`);
    socket.name = name;
    io.sockets.emit('update', {
      type: 'connect',
      name: 'SERVER',
      message: `${name}님이 접속`,
    });
  });

  /* 전송한 메시지 받기 */
  socket.on('message', (data: any) => {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name;

    console.log(data);

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', data);
  });

  /* 접속 종료 */
  socket.on('disconnect', () => {
    console.log(`${socket.name}님이 나가셨습니다.`);

    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', {
      type: 'disconnect',
      name: 'SERVER',
      message: `${socket.name}님이 나가셨습니다.`,
    });
  });
});
