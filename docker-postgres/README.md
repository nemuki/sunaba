# docker-postgres

<https://hub.docker.com/_/postgres> のテンプレ

## 起動・終了

```sh
# 起動
docker compose up -d

# 終了
docker compose down -v
```

## DB接続

```sh
# CLIクライアント
❯ brew install libpq

# 接続
❯ psql --host localhost --port 5432 --username sunaba --dbname sunaba
Password for user sunaba: 
psql (16.4, server 16.2 (Debian 16.2-1.pgdg120+2))
Type "help" for help.

sunaba=# ^D\q
```
