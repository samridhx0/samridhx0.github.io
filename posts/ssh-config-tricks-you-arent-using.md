# Your SSH Config File is Just Sitting There Doing Nothing

Most people treat SSH like a hammer. `ssh user@host`, wait, type password (or key), done. But your `~/.ssh/config` file is basically a superpower that 90% of people never touch beyond maybe setting an IdentityFile.

Let's fix that.

## The Basics First

The config file lives at `~/.ssh/config`. If it doesn't exist:

```bash
touch ~/.ssh/config
chmod 600 ~/.ssh/config
```

A basic entry looks like:

```
Host myserver
    HostName 192.168.1.100
    User admin
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

Now instead of `ssh admin@192.168.1.100 -p 2222 -i ~/.ssh/id_ed25519` you just type `ssh myserver`. Wild, right?

## Jump Hosts Without the Pain

Got a bastion/jump host between you and the target? This is the old way:

```bash
ssh -J jumpuser@bastion.example.com admin@internal-server
```

The SSH config way:

```
Host internal-server
    HostName 10.0.0.50
    User admin
    ProxyJump jumpuser@bastion.example.com
```

Now `ssh internal-server` just works. It tunnels through the bastion automatically. You can even chain multiple jumps:

```
Host deep-internal
    HostName 10.10.0.20
    User root
    ProxyJump jumpuser@bastion.example.com,admin@10.0.0.50
```

## Keep Connections Alive

Nothing worse than your SSH session freezing because you stepped away for 5 minutes. Add this:

```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

This sends a keepalive packet every 60 seconds. If it gets no response 3 times in a row, it gives up. Way better than staring at a frozen terminal.

## Reuse Connections (ControlMaster)

Every time you open a new SSH connection to the same host, it does the full handshake again. ControlMaster lets multiple sessions share one TCP connection:

```
Host *
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600
```

Create the sockets dir first:

```bash
mkdir -p ~/.ssh/sockets
```

Now the second SSH to the same host opens almost instantly. Huge deal when you're opening 10 tabs to the same server.

## Dynamic SOCKS Proxy in One Line

Turn any SSH server into a SOCKS5 proxy:

```bash
ssh -D 1080 -N -f myserver
```

`-D 1080` opens a local SOCKS5 proxy on port 1080, `-N` says don't run any commands, `-f` backgrounds it. Point your browser's SOCKS proxy settings at `localhost:1080` and all traffic routes through that server.

Or stick it in config and add a shortcut:

```
Host myproxy
    HostName myserver.example.com
    User admin
    DynamicForward 1080
```

## Local and Remote Port Forwarding

Forward a remote port to your local machine (remote MySQL you can't access directly):

```bash
ssh -L 3307:localhost:3306 myserver
```

Now `mysql -h 127.0.0.1 -P 3307` connects to the MySQL on `myserver`. In config:

```
Host myserver
    LocalForward 3307 localhost:3306
```

Remote forwarding (expose your local port to the remote server):

```bash
ssh -R 8080:localhost:3000 myserver
```

Anyone hitting `myserver:8080` now gets your local port 3000. Useful for demos without deploying anything.

## Send Commands Without an Interactive Shell

Just need to run one thing?

```bash
ssh myserver 'df -h && uptime'
```

Or combine with a heredoc for multi-line scripts:

```bash
ssh myserver << 'EOF'
cd /var/log
grep "ERROR" app.log | tail -20
EOF
```

## The Full Global Config Block

Here's a solid baseline `~/.ssh/config` for most people:

```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600
    AddKeysToAgent yes
    IdentityFile ~/.ssh/id_ed25519
```

Read the full manual if you want to go deeper: `man ssh_config`. There's a lot in there. Like `Match` blocks that apply settings conditionally based on hostname, user, or even the result of running a command. It gets weird. Good weird.
