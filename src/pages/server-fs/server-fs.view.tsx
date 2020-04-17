import React from 'react';
import { useParams } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress';
import FolderIcon from '@material-ui/icons/Folder';
import RefreshIcon from '@material-ui/icons/Refresh';
import { ContextMenuItem, useContextMenu } from '../../components/context-menu';
import Page from '../../components/page';
import { FsEntry, parseFsEntry, useDuckList } from '../../api/list';
import { getServer } from '../../api/server-list';
import { duckUpload } from '../../api/upload';
import css from './style.scss';

const path = window.require('path');
const { ipcRenderer } = window.require('electron');

/*
TODO:
 - handle pathname changes
 - display last modified, permissions
 - context menu actions https://www.electronjs.org/docs/api/menu
    - create directory / mkdir
    - chmod
    - copy
    - download
    - delete
    - edit
 - open logs on menu-click
 - select more than one item in the list                                                              (check google photos to figure out mechanic)
   - double click to open a folder
   - double click a file downloads? opens with default app? prompt to let user choose?
   - click = select this one,
   - ctrl + click = ?
   - alt + click = ?
   - shift + click = ?
 - Floating action button to upload in current directory
 - drag file/folder from desktop to app to upload
   - when dragging above a file or nothing, display "upload to /"
   - when dragging above a folder, display "upload to /folder-name"
 - drag file/folder from app to desktop to download (if that's possible)
 - FAB button for upload
 - list of files currently uploading
 - list of files currently downloading
 - list of servers
 - connect to another server
 - not connected to any server page state
 - sorting list
 - drag & drop items to move them to other folders
 - virtualize list for HUGE content like assets.mmc.li/images
 - compact list mode
 */

export default function ServerFsView() {
  const [cwd, setCwd] = React.useState('/');
  const params = useParams<{ id: string }>();
  const server = getServer(Number(params.id));
  const uri = server.uri;

  const res = useDuckList({
    ...server,
    pathname: cwd,
  });

  const data = res.data;
  const entries = React.useMemo(() => {
    if (!data) {
      return [];
    }

    return data.split('\n')
      .map(parseFsEntry)
      .filter(item => item != null)
      .sort((a, b) => {
        if (a.isDir !== b.isDir) {
          if (a.isDir) {
            return -1;
          }

          if (b.isDir) {
            return 1;
          }
        }

        return a.name.localeCompare(b.name);
      });
  }, [data]);

  React.useEffect(() => {
    const listener = (_event, arg) => {
      console.log(arg);
    };

    ipcRenderer.on('menu-click', listener);

    return () => {
      ipcRenderer.removeListener('menu-click', listener);
    };
  }, []);

  useContextMenu(e => {
    const menu = [];

    if (e.target.closest('[data-fs-entry]') != null) {
      menu.push(
        new ContextMenuItem({
          label: 'Open With', // TODO: 'Delete all 3 items if selecting more than 1
        }),
        new ContextMenuItem({
          label: 'Download', // TODO: 'Download all 3 items if selecting more than 1
        }),
        new ContextMenuItem({ type: 'separator' }),
        new ContextMenuItem({
          label: 'Delete', // TODO: 'Delete all 3 items if selecting more than 1
        }),
        new ContextMenuItem({
          label: 'Copy To', // TODO: 'Copy all 3 items if selecting more than 1
        }),
        new ContextMenuItem({
          label: 'Duplicate', // TODO: 'Copy all 3 items if selecting more than 1
        }),
        new ContextMenuItem({
          label: 'Move To', // TODO: 'Copy all 3 items if selecting more than 1
        }),
      );
    }

    if (e.target.closest('[data-area="file-system"]')) {
      if (menu.length > 0) {
        menu.push(new ContextMenuItem({ type: 'separator' }));
      }

      menu.push(
        new ContextMenuItem({
          label: 'New Folder',
        }),
        new ContextMenuItem({
          label: 'Upload',
        }),
      );
    }

    return menu;
  }, []);

  // TODO use history state
  function clickEntry(entry: FsEntry) {
    if (entry.isDir) {
      setCwd(oldCwd => `${oldCwd + entry.name}/`);
    }
  }

  function goUp() {
    setCwd(oldCwd => path.dirname(oldCwd));
  }

  function refresh() {
    res.refetch();
  }

  function onDragEnter(e) {
    e.preventDefault();
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDragLeave(e) {
    e.preventDefault();
  }

  async function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const promises = [];

    for (const file of e.dataTransfer.files) {
      const from = file.path;
      const fileName = path.basename(file.path);
      const to = path.join(cwd, fileName);

      promises.push(duckUpload(server, from, to));
    }

    await Promise.all(promises);

    alert('upload complete');

    res.refetch();
  }

  /*
  // TODO: logs
  // - open through action menu (file -> logs)
  <pre className={css.logOutput}>
    Query Status: {res.status}
    {'\n\n'}

    Log:
    {data}
  </pre>
   */

  return (
    <Page>
      <div className={css.actionBar}>
        <IconButton
          title="Refresh"
          onClick={refresh}
          color="inherit"
          disabled={res.isFetching}
          classes={{
            disabled: css.disabledRefreshBtn,
          }}
        >
          <RefreshIcon />
        </IconButton>
        <form className={css.changeCwdForm}>
          <span>{uri}</span>
          <input name="cwd" value={cwd} className={css.cwdInput} />
        </form>
      </div>

      <div className={css.activityBarWrapper}>
        {res.isFetching && <LinearProgress className={css.activityBar} />}
      </div>

      <div
        data-area="file-system"
        className={css.fsArea}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <List>
          {cwd !== '/' && (
            <ListItem className={css.fsEntry} button onClick={goUp}>
              <ListItemIcon className={css.fsEntryIcon}>
                <FolderIcon color="inherit" />
              </ListItemIcon>
              <ListItemText
                primary=".."
              />
            </ListItem>
          )}
          {entries.map(entry => {
            return (
              <ListItem
                key={entry.name}
                className={css.fsEntry}
                button
                onClick={() => clickEntry(entry)}
                data-fs-entry={entry.name}
              >
                <ListItemIcon className={css.fsEntryIcon}>
                  {entry.isDir && (
                    <FolderIcon color="inherit" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={entry.name}
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    </Page>
  );
}
