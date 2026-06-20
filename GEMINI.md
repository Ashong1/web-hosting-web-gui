# AseroTech Web Project Instructions

## Testing & Database Safety
- **CRITICAL:** Never run `php artisan test` without first running `php artisan config:clear`. If the configuration is cached, Laravel will ignore `phpunit.xml` environment variables. This causes the `RefreshDatabase` trait to run against the production PostgreSQL database instead of the in-memory SQLite database, which will irreversibly wipe all production data.
- **SAFEGUARD ACTIVE:** A production safety guard has been implemented in `AppServiceProvider`. When `APP_ENV=production`, Laravel is now configured to prohibit all destructive commands (`db:wipe`, `migrate:fresh`, etc.). This provides a second layer of defense against accidental production wipes.

## Workspace Conventions
- Use `lucide-react` for icons.
- Build assets using `npm run build`. The scripts are configured to use `node --max-old-space-size=4096` and `NODE_OPTIONS` to prevent memory limits in both the main process and workers.
