# /proc is Not a Directory, It's a Lie (a Useful Lie)

`/proc` doesn't exist on disk. There's nothing there. It's a virtual filesystem the kernel conjures into existence at boot, and it's one of the most useful places on your entire system. Every process, every hardware stat, almost every kernel tuneable - it's all in there, readable as plain text files.

Most Linux users never look at it. That's kind of a shame.

## Poking Around

```bash
ls /proc
```

You'll see numbered directories like `1`, `42`, `1337` - those are process IDs. Plus a bunch of named files like `cpuinfo`, `meminfo`, `net`, `sys`.

```bash
cat /proc/cpuinfo
```

That's your CPU, in text. No tool needed. You can see the model name, number of cores, flags (the feature bits that matter for things like hardware virtualization).

```bash
grep -m1 "model name" /proc/cpuinfo
```

```bash
cat /proc/meminfo
```

Total RAM, available RAM, swap usage, cached pages - all there. `free` just reads this file and formats it for you.

## Every Running Process is a Directory

```bash
ls /proc/1/
```

PID 1 is init or systemd depending on your system. Inside that directory:

- `cmdline` - the command that started the process
- `environ` - the environment variables (NUL-separated)
- `fd/` - symlinks to every open file descriptor
- `maps` - memory map (what's loaded where)
- `status` - human-readable process state
- `net/` - network stats for this process's namespace

```bash
cat /proc/1/cmdline | tr '\0' ' '
```

The `tr '\0' ' '` part converts null bytes to spaces since cmdline uses NUL as a separator.

```bash
# See what files a process has open (replace PID)
ls -la /proc/$(pgrep nginx)/fd
```

## Find What Process is Using a Port (without lsof)

```bash
cat /proc/net/tcp
```

Gives you TCP connections in hex. Not the prettiest. The first column is the slot number, the second is local address:port in hex, third is remote. You can decode it:

```bash
# Convert hex port to decimal
printf "%d\n" 0x0050
# 80
```

Or just use the more readable approach:

```bash
cat /proc/net/tcp6
```

The inode column in there matches up with what you see in `/proc/<pid>/fd`. That's how `ss` and `lsof` work under the hood.

## Kernel Parameters Live in /proc/sys

This is huge. Almost everything tuneable about the kernel is a file in `/proc/sys/`:

```bash
# See current max open files limit
cat /proc/sys/fs/file-max

# See IP forwarding status (1 = enabled, 0 = disabled)
cat /proc/sys/net/ipv4/ip_forward

# Enable IP forwarding temporarily (no reboot needed, but doesn't persist)
echo 1 > /proc/sys/net/ipv4/ip_forward
```

That echo trick is how you change kernel params on the fly. `sysctl` does the same thing but with a nicer interface:

```bash
sysctl net.ipv4.ip_forward
sysctl -w net.ipv4.ip_forward=1
```

For persistence, write to `/etc/sysctl.conf` and run `sysctl -p`.

## Interesting One-Liners Using /proc

Check how long the system has been running:

```bash
awk '{print int($1/86400)"d "int(($1%86400)/3600)"h "int(($1%3600)/60)"m"}' /proc/uptime
```

See all listening processes and their command lines without any external tools:

```bash
for pid in /proc/[0-9]*/net/tcp; do
    cat "$pid" 2>/dev/null
done | grep " 0A " | awk '{print $2}' | while read addr; do
    port=$(printf "%d" 0x${addr##*:})
    echo $port
done | sort -un
```

Get memory usage of a specific process:

```bash
awk '/VmRSS/{print $2/1024 " MB"}' /proc/$(pgrep firefox)/status
```

## /proc/self

Here's a neat one. `/proc/self` always points to the current process. So if you're in a script:

```bash
cat /proc/self/cmdline | tr '\0' '\n'
```

That shows the script's own command and arguments. Useful for introspection.

```bash
# See your script's own environment
cat /proc/self/environ | tr '\0' '\n'
```

## Digging Into /proc for Security Research

When you're looking at a process you don't trust:

```bash
# See the actual binary that launched a process (even if it renamed itself)
ls -la /proc/<pid>/exe

# Dump memory maps
cat /proc/<pid>/maps

# Check what namespaces it's in
ls -la /proc/<pid>/ns/
```

That last one is useful for container work. Each namespace symlink shows what the process is isolated into - network, PID, mount, etc.

The `/proc` filesystem is one of those things where the more you poke at it, the more you realize how much of Linux's internals are just... readable text files waiting for you to find them.
