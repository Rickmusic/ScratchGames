# The Logs

Our system currently makes use of two loggers: [`morgan`](https://github.com/expressjs/morgan) and [`winston`](https://github.com/winstonjs/winston)

##Log files:

- `access.log`: logs the requests made by clients to the node server (managed by morgan)
- `database.log`: logs the database queries and any database related info and error messages (managed by winston)
- `exception.log`: logs any Unhandled Exceptions that get thrown (managed by winston)

Please be aware that all files manages by morgan do not have a filesize cap. 
Winston log files are configured with a max file size of 2MB.

##Console Ouput

Console output is done through winston, although there may be cases where npm packeges call `console.log`.

The majority of console messages will either be `info`, `warn`, or `error`.
These are different log levels provided by winston, and you can read more about them [here](https://github.com/winstonjs/winston#logging-levels).

All log files map to a console log label (shown in brackets after the message level):
- `access.log` -> `[access]`
- `database.log` -> `[sequelize]`
- `exception.log` -> no label
Although morgan is the engine for the access log, it will pass messages for console to winston allowing consistent console output.

The log files may contain more messages than is being displayed in the console.
This is because they are configured to capture more log levels than the console. 

Winston will also create console messages without a log label if no logger transport has been loaded. These messages are not writen to any log file.

