Go and grab a version of Nginx from <https://nginx.org/en/download.html>.
We are building and testing with version 1.12.2 currently.

To Install:
- Copy `conf/nginx.conf` to a temporary location
- Expand Nginx into into this directory (`/nginx` from project root)
- Overwrite the `conf/nginx.conf` file provided by Nginx with the one supplied by this repo

To Run:
- On windows machines, from the command line in the `/nginx` directory run: `start nginx.exe`
  - Nginx will run until you quit it. Using `start` will create a new terminal just for `nginx.exe` so you can continue to use the current one.
- To reload the Nginx config run: `nginx.exe -s reload`
- To quit Nginx run: `nginx.exe -s quit`

Note that git will only track `nginx/README.md` and `nginx/conf/nginx.conf`, and will ignore everything else in the `/nginx` directory.
Please be sure to not overwrite our `conf/nginx.conf` with Nginx's default config.
