import { useQuery } from 'react-query';

const util = window.require('util');
const exec = util.promisify(window.require('child_process').exec);

export type FsEntry = {
  permissions: string,
  name: string,
  lastModified: Date,
  isDir: boolean,
};

const MONTH_INDICES = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export function parseFsEntry(str: string): FsEntry | null {
  // parses the following format
  /*
  -rw-r--r-- 05-Feb-2018 15:08:30 .bash_logout
  -rw-r--r-- 05-Feb-2018 15:08:26 .bash_profile
  -rw-r--r-- 05-Feb-2018 15:08:27 .bashrc
  -rw-r--r-- 05-Feb-2018 15:08:26 .ovhconfig
  drwxr-xr-x 12-Oct-2018 18:11:31 www
  */
  const fsEntryRegex = /^(?<dir>[d-])(?<perms>(?:[r-][w-][x-]){3})\s+(?<edit_day>[0-9]{2})-(?<edit_month>[a-z]{3})-(?<edit_year>[0-9]{4})\s+(?<edit_hour>[0-9]{2}):(?<edit_minute>[0-9]{2}):(?<edit_second>[0-9]{2})\s+(?<name>.+)$/i;

  const match = str.match(fsEntryRegex);

  if (!match) {
    return null;
  }

  const groups = match.groups;

  return {
    permissions: groups.perms,
    name: groups.name,
    lastModified: new Date(
      Number(groups.edit_year),
      MONTH_INDICES[groups.edit_month.toLowerCase()],
      Number(groups.edit_day),

      Number(groups.edit_hour),
      Number(groups.edit_minute),
      Number(groups.edit_second),
    ),
    isDir: groups.dir === 'd',
  };
}

export type RemoteLocation = {
  uri: string,
  pathname: string,
  username: string,
  password: string,
};

export function useDuckList(loc: RemoteLocation) {
  const url = new URL(loc.uri);
  url.username = loc.username;
  url.password = loc.password;
  url.pathname = loc.pathname;

  return useQuery(url.toString(), fetchDuckList, {
    refetchOnWindowFocus: false,
  });
}

async function fetchDuckList(urlString) {
  const url = new URL(urlString);
  const { password, username } = url;

  url.password = '';
  url.username = '';

  const res = await exec(`duck --longlist ${url.toString()} -u ${username} -p ${password} -y --verbose --quiet`);

  if (res.stderr) {
    console.dir(res.stderr);
  }

  return res.stdout;
}
