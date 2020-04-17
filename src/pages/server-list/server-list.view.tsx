import React, { SyntheticEvent } from 'react';
import { useHistory, generatePath } from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Page from '../../components/page';
import Separator from '../../components/separator';
import { SERVER_FS_PATHNAME } from '../server-fs/server-fs.route';
import { addServer } from '../../api/server-list';
import { FtpForm } from './forms/ftp';
import css from './style.scss';

/*
TODO
 - server list
 - FAB on server list to add a new server
 - context menu on server list to forget a server
 - how to pass info from server-list to server-view safely?
    - app volatile state
    - if saving server to keychain, remember server name in localstorage
      else keep credentials in volatile state
    - on "connect" click
      -> attempt connection
      -> save server info in localStorage (not the password)
      -> keep credentials in volatile memory
      -> open server-fs.view using history.push({}). Put server URL & username in route state
 */

/*
ftp://175106_ephys:bUkWKDsPqNNCRx6@62.210.45.54:21
 */

export default function ServerListView() {
  return (
    <Page className={css.page}>
      <NewServerPopup />
    </Page>
  );
}

const SERVER_TYPES = {
  ftp: {
    form: FtpForm,
    name: 'FTP (File Transfer Protocol & variants)',
  },
  s3: {
    form: null,
    name: 'Amazon S3',
  },
};

// TODO
//  - WebDAV HTTP & HTTPS
//  - FTP, FTP-SSL, SSH FTP
//
//  TODO proprietary
//  - Windows Azure Blob Storage
//  - Backblaze B2 Cloud Storage
//  - DRACOON OAuth
//  - Google Cloud Storage
//  - Amazon S3
//  - OpenStack Swift (Keystone 2.0)
//  - Rackspace Cloud Files (US)
//  - OpenStack Swift (Keystone 3)
//  - Dropbox
//  - Google Drive
//  - Nextcloud & ownCloud
//  - Microsoft OneDrive
//  - Microsoft SharePoint
//  - local

function NewServerPopup() {

  const [serverType, setServerType] = React.useState('ftp');
  const [url, setUrl] = React.useState('');
  const [urlEditKey, setUrlEditKey] = React.useState(0);
  const history = useHistory();

  const FormComponent = SERVER_TYPES[serverType]?.form;

  const attemptConnect = React.useCallback((e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urlObj = new URL(url);

    const { username, password } = urlObj;
    urlObj.username = '';
    urlObj.password = '';

    const id = addServer({
      uri: urlObj.toString(),
      username,
      password,
    });

    history.push({
      pathname: generatePath(SERVER_FS_PATHNAME, { id }),
    });
  }, [url, history]);

  return (
    <div className={css.newServerPopup}>
      <h1>Add a server</h1>
      <form className={css.newServerForm} onSubmit={attemptConnect}>
        <div className={css.fieldGroup}>
          <InputLabel>Server URL</InputLabel>
          <Input
            className={css.urlInput}
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setUrlEditKey(key => key + 1);
            }}
          />
        </div>

        <Separator>Or</Separator>

        <Select
          value={serverType}
          onChange={e => setServerType(e.target.value)}
        >
          {Object.keys(SERVER_TYPES).map(key => {
            return <MenuItem value={key} key={key}>{SERVER_TYPES[key].name}</MenuItem>;
          })}
        </Select>

        {FormComponent && <FormComponent onUrlChange={setUrl} url={url} urlEditKey={urlEditKey} />}

        <div className={css.fieldGroup} style={{ alignSelf: 'flex-end' }}>
          <Button color="primary" variant="contained" type="submit">Connect</Button>
        </div>
      </form>
    </div>
  );
}

