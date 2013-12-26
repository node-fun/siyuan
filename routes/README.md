# Routes

Routes in `siyuan`

## Views

- `/`
	> Home Page

## API

- `offset`/`page`, `limit`
	> All `GET` api accept these three parameters,
	for a pagination.

### Users

- `/api/users/find`
	> List users with some conditions
	Accepts: `id`, `username`, `email`, `isonline`

- `/api/users/search`
	> Like `find`, but using fuzzy queries
	Accepts: `username`
