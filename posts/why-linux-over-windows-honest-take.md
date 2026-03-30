# Windows is Fine. I Just Don't Want It.

Let me be upfront: this isn't a "Windows bad, Linux good" rant. Windows works. Billions of people use it and get real work done. My grandma uses Windows and she's never had a problem, because she browses Facebook and watches YouTube.

But I've been on Linux exclusively for years now, and there are concrete reasons why I'm not going back. Here's the honest version.

## The Telemetry Thing is Real

Windows 10 and 11 send a *lot* of data back to Microsoft. You can reduce it. You can't turn it off completely.

Proof: spin up a fresh Windows 11 install with the most restrictive privacy settings you can find. Then run Wireshark and watch the traffic. You'll see connections to Microsoft endpoints even when you're not doing anything.

On Linux, `netstat -tulnp` after boot shows only what you explicitly ran. No background phoning home from the OS itself.

```bash
# On a fresh Linux install, see what's actually listening
ss -tulnp
```

Compare that output to running Wireshark on a Windows box. The difference is notable.

## The Filesystem Layout Makes Sense

On Windows, application state is scattered everywhere. Some in `C:\Program Files`, some in `C:\Users\you\AppData\Local`, some in `C:\Users\you\AppData\Roaming`, some in the registry, some in `%LOCALAPPDATA%`. Uninstalling an application leaves traces in all of these places.

On Linux the FHS (Filesystem Hierarchy Standard) gives everything a home:

- Binaries: `/usr/bin`, `/usr/local/bin`
- Config: `/etc` (system) or `~/.config` (user)
- Data: `/var`
- Logs: `/var/log`
- User files: `/home`

When you remove a package with your package manager:

```bash
sudo apt purge mypackage
sudo apt autoremove
```

It's actually gone. The config files in `/etc` might stay if they were modified (which is what `purge` vs `remove` handles), but the binary and its dependencies are cleaned up. No registry ghosts.

## The Package Manager Changes Everything

Installing software on Windows still often means: find website, click download, run installer, click through wizard, maybe accept some toolbar. In 2025.

On Linux:

```bash
sudo apt install htop git vim curl wget python3 neovim tmux
```

One line, all installed, all tracked, all updatable together:

```bash
sudo apt upgrade
```

Every package. At once. Including the kernel if there's a security update.

On Arch (or derivatives like Manjaro):

```bash
sudo pacman -Syu
```

Rolling release. You're always on the latest. The AUR (Arch User Repository) has basically everything else:

```bash
yay -S spotify zoom
```

No hunting for downloads. No "is this installer from the real website or a shady mirror" anxiety.

## Scripting and Automation Are First-Class Citizens

The shell is the OS on Linux. Everything is a file, pipes connect programs, you can automate anything with a few lines of bash.

Want to find all files modified in the last hour, compress them, and upload to a server?

```bash
find /home/user/work -mmin -60 -type f | tar czf - -T - | ssh backup@myserver "cat > /backups/$(date +%Y%m%d_%H%M).tar.gz"
```

That's one line. Try writing the equivalent batch/PowerShell script for someone who doesn't already know PowerShell deeply.

PowerShell is actually powerful, to be fair. But it's a second-class citizen compared to the native shell on Linux. On Linux the shell is how you interact with the OS at every level, so every tool is designed around composability.

## The Performance on Older Hardware

Linux runs well on hardware that Windows 11 refuses to support. I have a 2013 ThinkPad running Fedora 40 with full disk encryption, and it's snappy. Windows 11 won't install on it at all (no TPM 2.0).

Server workloads run faster on Linux too. Not because the code is magic, but because the OS overhead is lower. There's no Explorer.exe, no indexing service, no Windows Update running in the background while you're trying to work.

```bash
# Check memory usage right after boot on a minimal Linux install
free -h
```

Compare that to Windows which needs several GB just for the OS to be idle.

## You Learn More

This one's subjective, but genuine. When things break on Windows, you either reinstall or call support. When things break on Linux, you read a log file and fix it.

```bash
journalctl -xe | tail -50
```

That command shows recent system logs with extended explanations. You can almost always figure out what broke and why. After doing that a few dozen times, you actually understand your system. It's not magic, it's just a collection of programs running.

That knowledge transfers. Server administration, cloud infrastructure, security work - it all runs on Linux. The people who understand how their OS works are the ones who end up doing the interesting problems.

## The Part Where I'm Honest

Linux has real friction. Hardware compatibility is better than it used to be, but some things (certain WiFi chips, Nvidia GPUs, fingerprint readers) still require effort. Some commercial software you might need (Adobe suite, certain games) doesn't run natively.

Proton/Steam has changed gaming dramatically and a lot of games just work now. Wine handles some Windows software. But there are still gaps.

If your workflow depends on specific Windows-only software, or if you're not interested in occasionally debugging a config file, Windows is probably the right choice and that's fine.

But if you're curious about how computers actually work, or you do any kind of development, security, or sysadmin work - Linux is worth the initial investment. Heavily.
