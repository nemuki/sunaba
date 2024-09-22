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

sunaba=# select * from main.sandbox_data;
 id | username |       email       |         created_at         
----+----------+-------------------+----------------------------
  1 | user1    | user1@example.com | 2024-09-22 01:53:31.933084
  2 | user2    | user2@example.com | 2024-09-22 01:53:31.933084
  3 | user3    | user3@example.com | 2024-09-22 01:53:31.933084
  4 | user4    | user4@example.com | 2024-09-22 01:53:31.933084
  5 | user5    | user5@example.com | 2024-09-22 01:53:31.933084
(5 rows)

sunaba=#
```

## 参考

- [Compose file reference | Docker Docs](https://docs.docker.com/reference/compose-file/)
- [2024年版のDockerfileの考え方＆書き方 | フューチャー技術ブログ](https://future-architect.github.io/articles/20240726a/)
- [Docker / Docker Compose を使って開発環境を用意するときの Tips - WILLGATE TECH BLOG](https://tech.willgate.co.jp/entry/2023/12/01/120000)
