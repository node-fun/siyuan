# siyuan

An SNS backend framework, with Node and MySQL

## Install

1. Install Node and MySQL

2. Download or clone the repository

	```sh
	$ git clone git@github.com:node-fun/siyuan.git
	$ cd siyuan
	```

3. Install dependencies

	```sh
	$ npm install -d
	```

4. Copy the `config`, and modify as you need

	```sh
	$ cp -r config.default config
	```

5. Setup the database

	```sh
	$ node setup [environment]
	```

	Usually, environment could be either `development`(default) or `production`.<br>
	Testing records come with a development mode.

## Run

```sh
$ node . [environment]
```

## Test

```sh
$ npm test
```
