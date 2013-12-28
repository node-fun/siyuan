# Routes

Routes in `siyuan`

## Views

- `/`

	Home Page

## API

- JSON

	Every api returns a JSON.

- Errors

	Most error codes and messages are learnt from -<br>
	<http://open.weibo.com/wiki/Error_code>

- Timestamps

	All date-typed values are shown in javascript timestamps,<br>
	in milliseconds, such as `1374873405000`

- `offset`/`page`, `limit`

	All `GET` api accept these three parameters, for a pagination.

### Users

- `GET /api/users/find`

	List users with some conditions<br>
	Accepts: `id`, `username`, `isonline`, `email`, `name`, `gender`
	```js
	// GET /api/users/find?isonline=1&gender=female&limit=2&page=3
	{
	  "users": [
		{
		  "id": 32,
		  "username": "lu",
		  "isonline": 1
		},
		{
		  "id": 35,
		  "username": "bidak",
		  "isonline": 1
		}
	  ]
	}
	```

- `GET /api/users/search`

	Like `find`, but using fuzzy queries<br>
	Accepts: `username`, `nickname`, `name`, `university`, `major`

- `GET /api/users/view`

	Return a detailed user, including `profile`<br>
	Accepts: `id`
	```js
	// GET /api/users/view?id=2
	{
      "user": {
        "id": 2,
        "username": "jicut",
        "regtime": 1374873405000,
        "isonline": 0,
        "profile": {
          "email": "omvowfol@du.co.uk",
          "nickname": "Lucia Clark",
          "name": "Elijah Sullivan",
          "gender": "female",
          "age": 35,
          "grade": 2004,
          "university": "Ebataduhe University",
          "major": "Sigogil"
        }
      }
    }
	```
