## SpigotBabySitter, What is it?
SpigotBabySitter is a simple, yet powerful minecraft server wrapper intended to be used with spigot. It implements many features such as a plugin manager, restarts, crash detection, custom directory layouts, automatic backups and restores.

## This seams awesome! How do I install it?
**When this hasn't been written within a month, someone bug me about it**

## Great, I installed it! How do I use it?
### Plugin manager:
#### Plugin installation
##### Jenkins
```!install jenkins <ServerAddress> <JobName>```
**Example:**
```!install jenkins http://ci.lolmewn.nl Stats```
This example would install the latest build of Stats3 by lolmewn from his build server. It's an awesome plugin, please check it out!
##### Spigot - NOT YET IMPLEMENTED
```!install spigot <PluginName>```
**Example:**
```!install spigot Stats```
This example would install the latest release of Stats3 by lolmewn from spigot.
##### Bukkit - NOT YET IMPLEMENTED
```!install bukkit <PluginName>```
**Example:**
```!install bukkit lolmewnstats```
This example would install the latest release of Stats3 by lolmewn from bukkit using bukget.
#### Plugins listing
```!plugins```
This command will list all plugins managed by SpigotBabySitter. It will return the source from where they were downloaded from aswell.