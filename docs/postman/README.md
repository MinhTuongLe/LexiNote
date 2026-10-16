# LexiNote Postman collection

Import [`LexiNote.postman_collection.json`](./LexiNote.postman_collection.json) into Postman.

## Swagger trực tiếp trên browser

Backend đã tích hợp Swagger UI. Khởi động backend trước:

```powershell
cd backend
npm run start:dev
```

Sau đó mở Swagger UI trên browser:

```text
http://localhost:1337/api/docs
```

OpenAPI JSON:

```text
http://localhost:1337/api/docs-json
```

Trong Swagger UI, bấm `Authorize` và nhập:

```text
Bearer <access-token>
```

Token client dùng cho các API trong nhóm `/api/v1/client`; token của tài khoản có role `ADMIN` dùng cho nhóm `/api/v1/dashboard`.

## Run locally

The collection defaults to:

```text
http://localhost:1337
```

Start the backend, open the collection, set `userEmail`/`userPassword` or `adminEmail`/`adminPassword` in the collection variables, then run the corresponding login request. The login test script stores the returned access and refresh tokens automatically, so all protected requests can be sent immediately afterward.

## Run against production

Change only the collection variable `apiOrigin` to the backend origin deployed for production, for example:

```text
https://api.example.com
```

The collection derives both API roots automatically:

```text
{{apiOrigin}}/api/v1/client
{{apiOrigin}}/api/v1/dashboard
```

The repository does not contain a production backend domain, so the production origin cannot be hard-coded safely. No endpoint URLs need to be edited after changing this one variable.

## Recommended order

1. `00 - Health & Swagger` → `Health check`
2. `01 - Client API` → `Auth` → `Login`
3. Run any client requests.
4. `02 - Dashboard API` → `Auth` → `Admin login`
5. Run dashboard requests.

The dashboard login must use an account with `role=ADMIN`; a normal client account receives `401 Unauthorized`.

## Important destructive requests

`Deactivate account`, `Delete user`, `Delete word`, `Bulk delete words`, `Reset word progress`, `Change password`, `Revoke sessions`, and archive deletion mutate or remove data. They are included for completeness but should not be run blindly in production.
