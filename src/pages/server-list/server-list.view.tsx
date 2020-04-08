import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Page from '../../components/page';
import Separator from '../../components/separator';
import { FtpForm } from './forms/ftp';
import css from './style.scss';
import Input from '@material-ui/core/Input';

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

  const FormComponent = SERVER_TYPES[serverType]?.form;

  return (
    <div className={css.newServerPopup}>
      <h1>Add a server</h1>
      <form className={css.newServerForm}>
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
      </form>
    </div>
  );
}

