import React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import css from '../style.scss';
import { getChangeValue } from '../../../utils/dom-utils';

/*
TODO:
  - FTP anonymous login
  - Save credentials to keychain
  - SSH Private Key (SSH FTP only)
*/

type FtpCredentials = {
  protocol?: 'ftp' | 'ftps' | 'sftp',
  hostname?: string,
  port?: string,
  username?: string,
  password?: string,
};

function useBind<T>(values: T, setValues, parentOnChange: (e: T) => void) {

  const onChange = React.useCallback(e => {
    const changedVal = getChangeValue(e);

    const newState = {
      ...values,
      [changedVal.name]: changedVal.value,
    };

    setValues(newState);
    parentOnChange(newState);
  }, [setValues, values, parentOnChange]);

  return function bind(fieldName: string) {
    return {
      value: values[fieldName] ?? '',
      name: fieldName,
      onChange,
    };
  };
}

type Props = {
  onUrlChange: (newUrl: string) => void,
  url: string,
  urlEditKey: number, // used to know if state needs to be reset because user manually edited the url
};

const DEFAULT_VALUES = {
  protocol: 'ftp',
  port: '21',
};

const DEFAULT_PORT = {
  ftp: '21', // and ftps
  sftp: '22', // and ssh
};

export function FtpForm(props: Props) {
  const [values, setValues] = React.useState<FtpCredentials>({});

  const bind = useBind(values, setValues, newValues => {

    try {
      const protocol = newValues.protocol;
      const url = new URL(`${protocol}://${newValues.hostname}`);
      url.port = newValues.port ?? ''; // or default
      url.username = newValues.username ?? '';
      url.password = newValues.password ?? '';

      props.onUrlChange(url.toString());
    } catch (e) {
      props.onUrlChange('');
    }
  });

  // ftp://ephys:secure-pwd@ephys.ovh.net

  React.useEffect(() => {
    try {
      // TODO move to Url as this doesn't parse sftp
      const url = new URL(props.url);

      // ftp: -> ftp
      const protocol = url.protocol.substr(0, url.protocol.length - 1);

      setValues({
        protocol,
        hostname: url.hostname,
        port: url.port || DEFAULT_PORT[protocol],
        username: url.username,
        password: url.password,
      });
    } catch (e) {
      setValues(DEFAULT_VALUES);
    }

  }, [props.urlEditKey]); // props.url should not be here

  return (
    <>
      <div className={css.fieldGroup} style={{ alignSelf: 'center', margin: '16px' }}>

        {/* TODO replace with checkboxes */}
        <InputLabel>Protocol</InputLabel>
        <ButtonGroup color="primary" aria-label="">
          <Button>FTP</Button>
          <Button title="Explicit AUTH TLS">FTP-SSL</Button>
          <Button title="SSH File Transfer Protocol">SSH-FTP</Button>
        </ButtonGroup>
      </div>

      <div className={css.fieldGroup} style={{ display: 'flex' }}>
        <div>
          <InputLabel>Server</InputLabel>
          <Input {...bind('hostname')} className={css.urlInput} />
        </div>

        <div style={{ marginLeft: '8px' }}>
          <InputLabel>Port</InputLabel>
          <Input {...bind('port')} type="number" className={css.urlInput} style={{ maxWidth: '100px' }} />
        </div>
      </div>

      <div className={css.fieldGroup}>
        <InputLabel>Username</InputLabel>
        <Input {...bind('username')} className={css.urlInput} />
      </div>

      <div className={css.fieldGroup}>
        <InputLabel>Password</InputLabel>
        <Input {...bind('password')} className={css.urlInput} />
      </div>
    </>
  );
}
