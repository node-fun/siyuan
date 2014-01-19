# siyuan

An SNS backend framework, with Node and MySQL

## Install

1. Make sure you have Node and MySQL installed already

2. Download the package, and enter it

	```sh
	$ cd siyuan
	```

3. Install the dependencies

	```sh
	$ npm install -d
	```

4. Copy the `config` directory, and modify it if you need

	```sh
	$ cp -r config.default config
	```

5. Setup the database

	```sh
	$ node setup [environment]
	```

	Usually, environment could be either `development` or `production`(default).<br>
	Testing records will be inserted with a development mode.

## Run

```sh
$ node . [environment]
```

## Test

```sh
$ npm test
```
