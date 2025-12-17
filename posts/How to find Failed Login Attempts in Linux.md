How to find Failed Login Attempts in the Auth.log / Linux?

>Go to `/var/log` (this directory is often hidden)
>Type `grep "Failed password" auth.log`  

the directory '/var/log' is the directory where all the logs are saved.

> `grep` is a very powerful tool used to search for specific words, phrases, or patterns inside text files, and shows the matching lines on your screen. [Here](https://man7.org/linux/man-pages/man1/grep.1.html)you can find it's documentation.

TBC

