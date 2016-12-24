## SpigotBabySitter, What is it?

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b7dae13cf2a44ca0b7e8fa26c30cc976)](https://www.codacy.com/app/Zeyphros/SpigotBabySitter?utm_source=github.com&utm_medium=referral&utm_content=robinp7720/SpigotBabySitter&utm_campaign=badger)

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
##### Spigot
```!install spigot <PluginName/Id>```

The only argument avaliable when using spigot's plugin repos is the plugin name or ID. Using the plugin name is easier by may result in the wrong plugin being downloaded as mulitple plugins can be uploaded using the same name. When multiple plugins are found with the name, it will use the first plugin found. To be specific about the plugin you wish to install, use the plugin id which can be retrieved from the url of the resource.

##### Bukkit - NOT YET IMPLEMENTED

```!install bukkit <PluginName>```

**Example:**

```!install bukkit lolmewnstats```

This example would install the latest release of Stats3 by lolmewn from bukkit using bukget.

#### Plugin management

```!plugins list```

This command will list all plugins managed by SpigotBabySitter. It will return the source from where they were downloaded from aswell.

```!plugins update```

This will attempt to update all plugins managed by SpigotBabySItter
