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
	```js
	// GET /api/users/view?id=102
	{
      "request": "/api/users/view?id=102",
      "error_code": 20003,
      "error": "user not found"
    }
	```

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
	// GET /api/users/find?isonline=1&gender=f&limit=2&page=3
	{
      "users": [
        {
          "id": 14,
          "username": "nemjoptaz",
          "isonline": 1
        },
        {
          "id": 20,
          "username": "pa",
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
	// GET /api/users/view?id=88
	{
      "user": {
        "id": 88,
        "username": "zodisukeg",
        "regtime": 1357441421000,
        "isonline": 1,
        "profile": {
          "email": "rofno@alube.net",
          "nickname": "Brady Robertson",
          "name": "Stephen Brady",
          "gender": "m",
          "age": 46,
          "grade": 1986,
          "university": "Sihijsa University",
          "major": "Viwrun"
        }
      }
    }
	```

- `POST /api/users/reg`

	Perform a user register
	```js
	// POST /api/users/reg
	//   username, password, profile[email],
	//   profile[nickname], profile[name] ...
	{
      "id": 101
    }
	```
