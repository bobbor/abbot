# jenkins
simple nodejs jenkins client to poll job statuses

### Installation
```bash
$ npm -g i bobbor/jenkins
```

### Usage

```bash
$ jenkins
```

**NOTE:** when running `jenkins` for the first time, it will ask 
you for your credentials. these are saved and will not be asked again

#### Parameters

Both parameters may be supplied. If they are (partially)
omitted you will be prompted to provide them
```
    --project - the name of the project to observe
    --job [lastBuild] - the build id (usually a number like 5702, or 42)
```