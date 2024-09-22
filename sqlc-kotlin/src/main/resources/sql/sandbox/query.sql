-- name: ListSandboxData :many
select * from main.sandbox_data
order by id;

-- name: GetSandboxDataById :one
select * from main.sandbox_data
where id = $1;
