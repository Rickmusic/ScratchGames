# The Logs

Our system currently makes use of two loggers: [`morgan`](https://github.com/expressjs/morgan) and [`winston`](https://github.com/winstonjs/winston)


Log files:
-----------

- `access.log`: logs the requests made by clients to the node server (powered by morgan)
- `authorization.log`: logs all signup/login/oauth/logout messages.
- `database.log`: logs the database queries and any database related info and error messages
- `exception.log`: logs any Unhandled Exceptions that get thrown

Log files are configured with a max file size of 1MB.
There may be up to two files per log (with the second having a number as a suffix); the file without a suffix is the newest. 


Console Ouput:
--------------

Console output is done through winston, although there may be cases where npm packeges call `console.log`.

The majority of console messages will either be `info`, `warn`, or `error`.
These are different log levels provided by winston, and you can read more about them [here](https://github.com/winstonjs/winston#logging-levels).

All log files map to a console log label (shown in brackets after the message level):

- `access.log` -> `[access]`
- `authorization.log` -> `[auth]`
- `database.log` -> `[sequelize]`
- `exception.log` -> no label

The log files may contain more messages than is being displayed in the console.
This is because they are configured to capture more log levels than the console. 

Winston will also create console messages without a log label if no logger transport has been loaded. These messages are not writen to any log file.

