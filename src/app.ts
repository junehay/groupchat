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
