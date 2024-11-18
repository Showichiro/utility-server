```
Usage:
  --mode              Mode of operation [echo|internal-server-error|delay|static]. Default is echo.
  --port              Port to listen on. Default is 3000.
  --delay-time        Delay time in milliseconds for delay mode. Default is 3000.
  --static-path       Path for serving static files. Defaults to current directory.
```

簡単に試したい場合

```
deno run -A https://raw.githubusercontent.com/Showichiro/utility-server/refs/heads/main/main.ts
```

CLIインストールする場合

```
deno install -A -g --name utility-server https://raw.githubusercontent.com/Showichiro/utility-server/refs/heads/main/main.ts
```

CLIからアンインストール

```
deno uninstall -g utility-server
```

開発時

```
deno task start
```
