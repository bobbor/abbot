# jenkins
simple nodejs jenkins client to poll job statuses.  
One job is polled at a time.  
As soon as job is done building, it will update the status and exit.

### Installation
```bash
$ npm -g i bobbor/jenkins
```

### Usage

```bash
$ jenkins
```

#### Parameters
The questions in the beginning can be overridden,
by providing them as paramters

| option | what it does |
|---|---|
| `--instance` | which instance (this can be the name of the instance, the url or its position in the list of instances) |
| `--job` | the name of the job to poll |
| `--build` | the build number |

### finished
When a build is finished, it will invoke the terminal bell and notify you.  
if you have the [terminal-notifier](https://github.com/julienXX/terminal-notifier) installed, it will use that as well.