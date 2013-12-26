# siyuan

An SNS backend framework, with Node and MySQL

## Install

1. Make sure you have Node and MySQL installed already

2. Download the package, and enter it
		```shell
		cd siyuan
		```

3. Install the dependencies
		```shell
		npm install -d
		```

4. Copy the `config` directory, and modify it if you need
		```shell
		cp config.default config
		```

5. Setup the databases (for production & test)
		```shell
		node setup
		```

## Run

- For production
		```shell
		node .
		```

- For test
		 ```shell
		test=1 node .
		```

## Test

```shell
npm test
```
