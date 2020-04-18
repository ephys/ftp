import { ServerCredentials } from './server-list';

const url = window.require('url');
const spawn = window.require('child_process').spawn;

export async function duckDelete(server: ServerCredentials, pathname: string) {

  const deleteUri = url.resolve(server.uri, pathname);

  const res = await spawn('duck', ['--delete', deleteUri, '-u', server.username, '-p', server.password, '-y', '--verbose']);

  res.stdout.on('data', data => {
    console.log(data.toString());
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
