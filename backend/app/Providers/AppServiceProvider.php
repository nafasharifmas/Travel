<?php

namespace App\Providers;

use Illuminate\Database\Events\ConnectionEstablished;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register SQLite math functions for local development and CI testing environments
        Event::listen(ConnectionEstablished::class, function (ConnectionEstablished $event) {
            if ($event->connection->getDriverName() === 'sqlite') {
                self::registerSqliteMathFunctions($event->connection->getPdo());
            }
        });

        try {
            if (DB::connection()->getDriverName() === 'sqlite') {
                self::registerSqliteMathFunctions(DB::connection()->getPdo());
            }
        } catch (\Throwable $e) {
            // Ignore during early bootstrap before DB is ready
        }
    }

    protected static function registerSqliteMathFunctions(\PDO $pdo): void
    {
        $pdo->sqliteCreateFunction('least', fn (...$args) => min($args));
        $pdo->sqliteCreateFunction('greatest', fn (...$args) => max($args));
        $pdo->sqliteCreateFunction('radians', fn ($deg) => deg2rad((float) $deg));
        $pdo->sqliteCreateFunction('cos', fn ($rad) => cos((float) $rad));
        $pdo->sqliteCreateFunction('sin', fn ($rad) => sin((float) $rad));
        $pdo->sqliteCreateFunction('acos', fn ($val) => acos((float) $val));
    }
}
