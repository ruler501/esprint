import { fork } from 'child_process';

import { isPortTaken } from '../util';
import { clearLine } from '../cliUtils';
import Client from '../Client';

export const connect = (options) => {
  const args = [];
  for (const [key, value] of Object.entries(options)) {
    args.push(`--${key}=${value}`);
  }

  const port = options.port;

  isPortTaken(port).then((isTaken) => {
    // start the server if it isn't running
    const client = new Client(options);

    if (!isTaken) {
      const child = fork(
        require.resolve('../startServer.js'), args, {
          silent: true,
          stdio: process.env.NODE_ENV !== 'test' ? 'inherit' : 'pipe',
        }
      );

      child.on('message', message => {
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        } else if (message.message) {
          clearLine();
          process.stdout.write(message.message);
        }
      });
    } else {
      client.connect();
    }
  });
};
