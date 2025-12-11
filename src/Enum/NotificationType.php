<?php
namespace App\Enum;
enum NotificationType: string
{
    case INFO = 'info';
    case WARNING = 'warning';
    case ERROR = 'error';
    case MAINTENANCE = 'maintenance';
    case MODULE = 'module';
}
