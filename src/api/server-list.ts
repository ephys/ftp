const serverList: Map<number, ServerCredentials> = new Map();

export type ServerCredentials = {
  uri: string,
  username: string,
  password: string,
};

export function addServer(server: ServerCredentials) {
  const lastServerId = sessionStorage.getItem('lastServerId') ?? 0;
  const id = Number(lastServerId) + 1;

  sessionStorage.setItem(`server-${id}`, JSON.stringify(server));
  sessionStorage.setItem('lastServerId', String(id));

  return id;
}

export function getServer(id: number): ServerCredentials | null {
  if (serverList.has(id)) {
    return serverList.get(id);
  }

  const uncached = sessionStorage.getItem(`server-${id}`);
  if (uncached == null) {
    return null;
  }

  const server = JSON.parse(uncached);
  serverList.set(id, server);

  return server;
}
