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

- `offset`/`page`, `limit`

	All `GET` api accept these three parameters,<br>
	for a pagination.

### Users

- `/api/users/find`

	List users with some conditions<br>
	Accepts: `id`, `username`, `email`, `isonline`

- `/api/users/search`

	Like `find`, but using fuzzy queries<br>
	Accepts: `username`
