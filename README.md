# cube-self-host

Mã nguồn Cube (lớp ngữ nghĩa có REST, GraphQL, SQL API) giữ trong GitLab của nhóm, để đọc, rà bảo mật và sửa khi cần cho kho dữ liệu `insur-dwh`.

- **Gốc:** tag [`v1.8.34`](https://github.com/cube-js/cube/tree/v1.8.34) của `cube-js/cube`, commit `134cc78`, cùng bản với image `cubejs/cube:v1.8.34` nhóm đang chạy. Giấy phép Apache-2.0, một số phần MIT ([LICENSE](LICENSE)).
- **README gốc:** [README.upstream.md](README.upstream.md).
- Repo không nối với GitHub: không có remote, không có lịch sử của upstream.

## Khác bản gốc

| Thay đổi | File |
|---|---|
| Bỏ CI của GitHub, cấu hình AI của upstream | `.github/`, `.claude/`, `.cursor/`, `CLAUDE.md` (đã xoá) |
| Bỏ trang tài liệu và ví dụ có host, mật khẩu, token mẫu | `docs-mintlify/`, `examples/` (đã xoá) |
| Bỏ mọi thư mục test, fixture trong `packages/` và `rust/` (57 thư mục); nhóm không chạy test của upstream | `test/`, `tests/`, `fixtures/`, `birdbox-fixtures/`, `__tests__/`, `__snapshots__/` (đã xoá) |
| Bỏ 10 file dựng database thử có mật khẩu viết sẵn | `docker-compose*.yml`, `environment` trong thư mục driver (đã xoá) |
| Bỏ hạ tầng test có secret, mật khẩu mẫu: 3 gói chỉ để test, file cấu hình thử của driver Pinot, Presto, hướng dẫn dev của cubesql | `packages/cubejs-testing`, `packages/cubejs-testing-drivers`, `packages/cubejs-testing-shared`, `packages/cubejs-pinot-driver/pinot-resources/`, `packages/cubejs-prestodb-driver/config/`, `rust/cubesql/DEVELOPMENT.md` (đã xoá) |
| Token JWT mẫu trong dòng hướng dẫn của lệnh `cubejs auth`, `cubejs typegen` thay bằng `<token>` | `packages/cubejs-cli/src/command/auth.ts`, `packages/cubejs-cli/src/command/typegen.ts` |
| Biến chạy mẫu, giá trị để trống | `.env.example` |
| README này; README gốc đổi tên | `README.md`, `README.upstream.md` |
| Pre-commit riêng: quét bí mật, cú pháp, chặn commit vào `production`. GitLab không chạy pipeline nào | `.pre-commit-config.yaml`, `scripts/security/scan_secrets.py` (chép nguyên từ `dagster-self-host`), `.gitlab-ci.yml` |

Ngoài 2 dòng hướng dẫn trên, chưa sửa dòng mã TypeScript hay Rust nào của Cube.

## Dùng trong kho

- Định nghĩa của kho nằm ở repo `dbt`: `cube/model/` (cube sổ, danh bạ, bảng servingv2 và view `doanh_thu_starmart`), sinh từ `semantic/catalog.yml` (`make semantic`).
- Chạy bằng image chính thức `cubejs/cube:v1.8.34`: gắn thư mục `cube/` của repo `dbt` vào `/cube/conf`, biến theo `.env.example`. Nhóm chưa build repo này từ nguồn (cần Node theo `.nvmrc`, Yarn 4, Rust).
- Bản tự host có REST, GraphQL, SQL API (giao thức Postgres) và trang Playground, không có chat; trợ lý `tro-ly-ai` gọi REST API.
- Trên server: tắt `CUBEJS_DEV_MODE`, đặt `CUBEJS_API_SECRET` thật, để Keycloak đứng trước.

## Kiểm tra: pre-commit trên laptop

```bash
uv tool install pre-commit      # một lần trên máy
pre-commit install              # một lần trong repo
```

| Hook | Làm gì |
|---|---|
| `secret-scan`, `detect-private-key`, `forbid-env-files` | chặn mật khẩu, token, khoá, IP nội bộ, file `.env` (trừ `.env.example`). File đã có ở HEAD chỉ quét dòng thêm / sửa |
| `check-yaml`, `check-toml`, `check-merge-conflict`, `check-added-large-files` | cú pháp, dấu xung đột, file trên 1 MB |
| `no-commit-to-branch` | không commit thẳng vào `production` |
| `shell-scripts` | `bash -n` cho `*.sh` |

`python3 -B scripts/security/scan_secrets.py --all` còn báo nhiều chỗ của upstream: mã commit trong các `CHANGELOG.md`, mã băm trong `yarn.lock`, `Cargo.lock`, IP ví dụ trong mã Rust (`host_filter.rs`), tên khoá trong mã, và giá trị giả trong test viết ngay trong file mã Rust (tài khoản giả kiểu foo / bar ở `cubestore/src/sql/mod.rs`, `streaming/mod.rs`; tài khoản postgres mặc định ở `cubesqlplanner/src/test_fixtures/test_utils/pg_service.rs`; bỏ chúng phải sửa mã Rust). Đã rà, không có bí mật thật.

## Nâng bản

Chưa làm lần nào. Cách dự kiến: tải cây file của tag mới (cùng bản image định dùng), chép đè lên repo (trừ các file ở mục "Khác bản gốc"), xoá lại đúng các thư mục, file trong bảng, chạy `scan_secrets.py --all`, commit bằng `git commit --no-verify`.
