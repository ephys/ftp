import { ServerCredentials } from './server-list';

const url = window.require('url');
const spawn = window.require('child_process').spawn;

// TODO: emit progression
// TODO: emit whether file already exists (line: "Action [resume, cancel, similar, compare, rename, skip, overwrite]:")
export async function duckUpload(server: ServerCredentials, from: string, to: string) {

  const uploadUri = url.resolve(server.uri, to);

  console.log(`duck --upload ${uploadUri} ${from} -u ${server.username} -p ${server.password} -y --verbose --quiet`);
  const res = await spawn('duck', ['--upload', uploadUri, from, '-u', server.username, '-p', server.password, '-y', '--verbose']);

  const lineEmitter = new LineEmitter(line => {
    console.log('LINE =>', line);
  });

  res.stdout.on('data', data => {
    lineEmitter.read(data.toString());
  });

  res.stderr.on('data', data => {
    // res.stdin.write(data);
    console.error(`ps stderr: ${data.toString()}`);
  });

  return new Promise((resolve, reject) => {
    res.on('close', resolve);
    res.on('error', err => reject(err));
  });
}

class LineEmitter {
  private data: string = '';
  private callback;
  private timeout;

  constructor(callback) {
    this.callback = callback;
  }

  read(data) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.data += data;

    this.emitLines();

    // if there is data remaining (didn't end in a newline), emit
    // the rest as long as nothing new has been emitted
    if (this.data) {
      this.timeout = setTimeout(() => {
        this.callback(this.data);
        this.data = '';
      }, 200);
    }
  }

  emitLines() {
    const firstNewLineIndex = this.data.indexOf('\n');
    if (firstNewLineIndex === -1) {
      return;
    }

    const line = this.data.substr(0, firstNewLineIndex);
    this.callback(line);

    this.data = this.data.substr(firstNewLineIndex + 1);

    this.emitLines();
  }
}
