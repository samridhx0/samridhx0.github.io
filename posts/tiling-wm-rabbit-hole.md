# Tiling Window Managers Will Ruin Normal Desktops For You

I want to warn you before we get into this: once you get comfortable with a tiling window manager, going back to a floating desktop feels like wearing oven mitts to type.

I'm serious. You've been warned.

## What's a Tiling WM

A traditional desktop (GNOME, KDE, macOS, Windows) uses a floating window model. Windows are boxes that float around. You drag them, resize them, overlap them. It's fine. You've done it your whole life.

A tiling window manager arranges every window so they don't overlap. New window opens? The existing windows shrink to make room. It tiles. You navigate with the keyboard. There's no taskbar, no dock, usually no window decorations. Just content.

The whole desktop is a keyboard-driven grid of windows.

## Why Bother

The mouse is slow. I know, heresy. But think about it: to switch from your terminal to your browser you move your hand to the mouse, move the cursor, click. That's several actions and a context switch that interrupts flow.

With a tiling WM you press `Mod+2` or `Alt+Shift+j` or whatever you bound and you're there. Hands never leave the keyboard.

For people who spend most of their day in terminals, editors, and browsers, the efficiency compounds. You get fast. Very fast.

## The Main Players

**i3** - The "learn this first" tiling WM. Manual tiling (you control the layout explicitly). Config is a plain text file. Incredible documentation. Community is huge.

Install on Debian/Ubuntu:

```bash
sudo apt install i3
```

Log out, select i3 from the display manager, log in. First launch asks you two questions: confirm config location, pick your Mod key (usually Super/Windows key or Alt).

**Sway** - i3 but for Wayland. If you're on a modern distro using Wayland (most are now), Sway is the path. Config is i3-compatible, so if you know i3 config you know Sway config.

```bash
sudo apt install sway
```

**dwm** - From the suckless project. It's 2000 lines of C. You configure it by editing the source and recompiling. No config file. If that sounds insane, it kind of is, and also kind of appeals to a specific type of person.

**Hyprland** - The current aesthetic-focused favorite. Wayland-native, has smooth animations (if that's your thing), lots of eye candy while still being a tiling WM. Very active development. Config syntax is its own thing.

**xmonad** - Written in Haskell. Config is Haskell. If you want to write Haskell to configure your window manager, xmonad is waiting for you.

## Basic i3 Config to Get You Started

Config lives at `~/.config/i3/config`. Here's a minimal useful setup:

```
# Mod key - Super (Windows key)
set $mod Mod4

# Font
font pango:Geist Mono 10

# Launch terminal
bindsym $mod+Return exec alacritty

# Launch app launcher (rofi)
bindsym $mod+d exec rofi -show run

# Kill focused window
bindsym $mod+Shift+q kill

# Change focus
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right

# Move focused window
bindsym $mod+Shift+h move left
bindsym $mod+Shift+j move down
bindsym $mod+Shift+k move up
bindsym $mod+Shift+l move right

# Workspaces
bindsym $mod+1 workspace number 1
bindsym $mod+2 workspace number 2
bindsym $mod+3 workspace number 3

# Move window to workspace
bindsym $mod+Shift+1 move container to workspace number 1
bindsym $mod+Shift+2 move container to workspace number 2

# Reload config
bindsym $mod+Shift+r reload

# Exit i3
bindsym $mod+Shift+e exec i3-nagbar -t warning -m 'Exit i3?' -B 'Yes, exit i3' 'i3-msg exit'

# Split horizontal/vertical
bindsym $mod+b split h
bindsym $mod+v split v

# Fullscreen
bindsym $mod+f fullscreen toggle

# Floating toggle
bindsym $mod+Shift+space floating toggle

# Status bar (i3bar + i3status)
bar {
    status_command i3status
}
```

Reload with `Mod+Shift+r`. That's all you need to start.

## The Status Bar Situation

i3 comes with `i3bar` and `i3status`. They work but they're not fancy. The real moves:

**polybar** - Highly customizable bar. Modules for everything. Most rice setups you see on r/unixporn are using polybar.

**waybar** - Same idea but for Wayland/Sway.

**i3blocks** - Drop-in replacement for i3status with easier module scripting.

A minimal polybar config module showing CPU and memory:

```ini
[module/cpu]
type = internal/cpu
interval = 2
format = <label>
label = CPU %percentage%%

[module/memory]
type = internal/memory
interval = 2
format = <label>
label = MEM %percentage_used%%
```

## "Ricing" - Making It Look Good

The Linux community has a whole culture around making minimal setups look beautiful. The subreddit r/unixporn exists purely for sharing screenshots of configured Linux desktops.

The common stack:
- Tiling WM (i3/Sway/Hyprland)
- Terminal emulator (alacritty, kitty, foot)
- Status bar (polybar, waybar)
- App launcher (rofi, wofi, fuzzel)
- Color scheme (Catppuccin, Gruvbox, Nord, Dracula are the current favorites)

Dotfiles (your config files) get shared on GitHub. It's a whole thing.

But here's the real point: a tiling WM forces you to think about how you organize your workspace. What goes where. What workspaces you use. It's designing your own UI, for yourself, for how you actually work. That's genuinely interesting.

And once you build muscle memory for the keyboard shortcuts, you don't go back. Consider this your only warning.
