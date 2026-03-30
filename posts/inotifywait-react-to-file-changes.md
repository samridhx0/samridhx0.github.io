# inotifywait: React to File Changes Without Polling Like a Caveman

Polling is when you check something on a schedule. "Is the file changed? Not yet. Is it changed now? Not yet. Now? Now? Now?" It works. It's also wasteful and adds latency.

`inotifywait` is the better way. It asks the Linux kernel to notify you when a specific file or directory changes. The kernel knows. It always knows. Zero polling, zero wasted CPU, event fires immediately when something happens.

It's part of `inotify-tools`:

```bash
sudo apt install inotify-tools   # Debian/Ubuntu
sudo dnf install inotify-tools   # Fedora/RHEL
```

## The Basic Command

Watch a file and print what happens to it:

```bash
inotifywait -m /tmp/testfile
```

The `-m` flag means "monitor mode" - keep running and print events as they happen (without `-m` it exits after the first event).

Open another terminal and touch the file:

```bash
echo "hello" >> /tmp/testfile
```

You'll see output like:

```
/tmp/testfile MODIFY
/tmp/testfile CLOSE_WRITE,CLOSE
```

The events are: ACCESS, MODIFY, ATTRIB, CLOSE_WRITE, CLOSE_NOWRITE, OPEN, MOVED_FROM, MOVED_TO, CREATE, DELETE, DELETE_SELF, MOVE_SELF.

## Watch a Directory (Recursively)

```bash
inotifywait -m -r /home/user/projects/myapp
```

Now any change in any subdirectory fires an event. Useful but can get noisy.

Filter to specific events with `-e`:

```bash
inotifywait -m -r -e modify -e create -e delete /home/user/projects/myapp
```

## Auto-Reload a Service When Config Changes

Classic use case: you're editing nginx config and you want it to reload automatically on save:

```bash
inotifywait -m -e close_write /etc/nginx/nginx.conf |
while read path action file; do
    echo "Config changed, reloading nginx..."
    sudo nginx -t && sudo systemctl reload nginx
done
```

The `nginx -t` tests the config first. If the syntax is wrong, it skips the reload and you keep the old config running. That's a nice safety net.

## Auto-Run Tests When Code Changes

Poor man's test watcher:

```bash
inotifywait -m -r -e close_write --include '\.py$' ./src |
while read path action file; do
    echo "Changed: $file - running tests"
    python -m pytest tests/ -x -q 2>&1 | tail -20
done
```

`--include` takes a regex to filter by filename. Only `.py` files trigger a test run.

For a Go project:

```bash
inotifywait -m -r -e close_write --include '\.go$' . |
while read path action file; do
    echo "Running: go build ./..."
    go build ./... && echo "Build OK" || echo "Build FAILED"
done
```

## Sync Files to a Remote Server on Change

Writing on your local machine but deploying to a dev server? Skip manual rsync:

```bash
inotifywait -m -r -e close_write --format '%w%f' ./src |
while read file; do
    rsync -avz --relative "$file" user@devserver:/var/www/app/
    echo "Synced: $file"
done
```

`--format '%w%f'` outputs just the full path of the changed file (directory + filename). That feeds into rsync which only sends that one file.

## Watch for Suspicious Activity (Basic IDS)

Here's a simple tripwire for sensitive files:

```bash
#!/bin/bash
WATCH_DIR="/etc"
LOG="/var/log/file-watch.log"

inotifywait -m -r -e modify -e create -e delete \
    --format '%T %w%f %e' \
    --timefmt '%Y-%m-%d %H:%M:%S' \
    "$WATCH_DIR" | while read event; do
    echo "$event" >> "$LOG"
    echo "ALERT: $event" | mail -s "File change in $WATCH_DIR" admin@example.com
done
```

This logs every modification under `/etc` with a timestamp and optionally emails you. Real IDS tools (AIDE, Tripwire) do this more thoroughly with checksums, but this gives you the idea with 15 lines of bash.

## The inotifywait Limits

The kernel has a limit on how many watches you can have open at once. Check it:

```bash
cat /proc/sys/fs/inotify/max_user_watches
```

Default is often 8192 on most distros. If you're watching large directories (like a whole user home or a big codebase), you might hit this. Increase it:

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## inotify in Other Languages

The bash wrapper is great for quick scripts. For anything more complex, every major language has a library:

- Python: `watchdog` (`pip install watchdog`)
- Go: `fsnotify` (`go get github.com/fsnotify/fsnotify`)
- Node.js: `chokidar` (`npm install chokidar`)
- Rust: `notify` crate

All of these wrap the same kernel inotify API under the hood on Linux. `inotifywait` is just the shell-friendly surface of a very powerful kernel feature.

The pattern of "react to events instead of polling for changes" shows up everywhere in good systems design. File changes, network packets, system signals. Wherever you're polling, ask if there's a notification API available. There usually is.
