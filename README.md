[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b7dae13cf2a44ca0b7e8fa26c30cc976)](https://www.codacy.com/app/Zeyphros/SpigotBabySitter?utm_source=github.com&utm_medium=referral&utm_content=robinp7720/SpigotBabySitter&utm_campaign=badger)

## SpigotBabySitter, What is it?
SpigotBabySitter is an extremely easy to use minecraft server wrapper which makes server management a breeze. Automated backups, restarts, timed command execution and plugin management are among the main features. Install plugins from spigot or jenkins with a single command and update all installed plugins with another. SpigotBabySitter will check if new versions are avaliable and install them with a single command. Automated downloaing of BuildTools and compilation of Spigot is also an integrated feature.

## This seams awesome! How do I install it?
Instalation of SpigotBabySitter is extremely easy. First you will need to have NodeJS and NPM installed. You can follow the official NodeJS installation guide here: https://nodejs.org/en/download/package-manager/

After you have NodeJS and npm installed, you can clone SpigotBabySitter.   
```git clone https://github.com/robinp7720/SpigotBabySitter.git ~/SpigotBabySitter```   
Now you need to install the (rather large amount of) dependancies for SpigotBabySitter using npm.   
```
cd ~/SpigotBabySitter; npm install
```   
That was it! You now have SpigotBabySitter installed. You can launch it with the following command:   
```
cd ~/SpigotBabySitter; node . 
```
Now you just need to compile Spigot, to do this, run the following command while SpigotBabySitter is running:   
```
!recompile
```

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

Huge shoutout to Spiget (https://spiget.org/) for the Spigot resource api. The plugins are still downloaded from spigot's resource page using the nodejs WebScrapper module to circumvate cloudflare's DOS protection.

##### Bukkit - NOT YET IMPLEMENTED

```!install bukkit <PluginName>```

**Example:**

```!install bukkit lolmewnstats```

This example would install the latest release of Stats3 by lolmewn from bukkit. Due to bukget's dicontinuation, plugin downloading from bukkit may not happen in the near future.

#### Plugin management

```!plugins list```

This command will list all plugins managed by SpigotBabySitter. It will return the source from where they were downloaded from aswell.

```!plugins update```

This will attempt to update all plugins managed by SpigotBabySitter. Before updating SpigotBabySitter will first check if and update is available to avoid redownloading all plugins again.

### Backup manager:
#### Manual backups
Using the command ```!backup``` a backup of the server can be initiated. The items backed up are defined in the config file at ```backup.defaultItems```. To manually choose what to backup during runtime can be done using arguments to the ```!backup``` command. For example, to backup the worlds and plugins you would use ```!backup worlds plugins```.
#### Automatic backups
Automatic backups are managed by the scheduler.
The following entry is a sample entry to backup worlds, plugins, settings and minecraft server files.
```
{
  "action": "backup",
  "items": [
    "worlds",
    "plugins",
    "settings",
    "server"
  ]
},
```
### Scheduler:
The built in scheduler allows for easy scheduling of periodic tasks such asd restarts, plugins updates and backups. Multiple schedulers can be defined in the config files within the schedule entry.
A sample scheduler looks like this:
```
{
  "every": 7200,
  "actions": [
    {
      "action": "command",
      "command": "say Server going for restart in 10 seconds",
      "wait": 10
    },
    {
      "action": "stop"
    },
    {
      "action": "backup",
      "items": [
        "worlds",
        "plugins",
        "settings",
        "server"
      ]
    },
    {
      "action": "updatePlugins"
    },
    {
      "action": "start"
    }
  ]
}
```
The ```every``` item defines how often it is run in seconds. 7200 seconds is equal to 2 hours. ```actions``` defines what should be run. The items are run in order in what they are defined in.

#### Run Server command
```
{
  "action": "command",
  "command": "say Server going for restart in 10 seconds",
  "wait": 10
}
```

```command``` is the command which will be run and ```wait``` is the time in seconds before running the next item.

#### Stop server
```
{
  "action": "stop"
}
```
#### Start server
```
{
  "action": "start"
}
```
#### Backup
```
{
  "action": "backup",
  "items": [
    "worlds",
    "plugins",
    "settings",
    "server"
  ]
}
```
```items``` defines the items which will be backed up
#### Update plugins
```
{
  "action": "updatePlugins"
}
```
