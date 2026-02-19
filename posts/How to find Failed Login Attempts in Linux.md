How to find Failed Login Attempts in the Auth.log / Linux?

> Go to `/var/log` (this directory is often hidden)
> Type `grep "Failed password" auth.log`

Quick commands and tips

- Check the current auth log (Debian/Ubuntu):

```
sudo grep "Failed password" /var/log/auth.log
```

- Include rotated/compressed logs:

```
sudo zgrep "Failed password" /var/log/auth.log*
```

- Watch failed attempts live:

```
sudo tail -f /var/log/auth.log | grep --line-buffered "Failed password"
```

- For systemd/journal systems (or when logs are managed by journalctl):

```
sudo journalctl -u sshd --since "1 hour ago" | grep "Failed password"
```

- Count total failed attempts:

```
sudo grep "Failed password" /var/log/auth.log | wc -l
```

- Count attempts per IP (extract IPs, sort, and show top offenders):

```
sudo grep "Failed password" /var/log/auth.log | grep -oP 'from \K[0-9\.]*' | sort | uniq -c | sort -nr
```

- Count attempts per username:

```
sudo grep "Failed password" /var/log/auth.log | grep -oP 'for( invalid user)? \K\S+' | sort | uniq -c | sort -nr
```

- Use `zcat` to read a specific compressed rotated file:

```
sudo zcat /var/log/auth.log.1.gz | grep "Failed password"
```

Quick defensive actions

- Block an offending IP with `ufw`:

```
sudo ufw deny from 1.2.3.4
```

- Or drop with iptables (use carefully):

```
sudo iptables -A INPUT -s 1.2.3.4 -j DROP
```

Notes and variations

- On RHEL/CentOS the same information is usually in `/var/log/secure` instead of `/var/log/auth.log`.
- Replace `sshd` with your SSH service name if different when using `journalctl`.
- Log formats can vary by distro and SSH configuration; the `grep -oP` extraction patterns above work for common OpenSSH messages.
- For automated blocking/mitigation consider using tools like `fail2ban` which parse logs and add temporary bans based on thresholds.

Stay safe: always run these commands with appropriate privileges and verify IPs before blocking.