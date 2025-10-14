<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable; // ✅ Add this
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable; // ✅ Add Notifiable

    protected $fillable = [
        'name',
        'email',
        'password',
        'currency_symbol', // ✅ Add currency_symbol
    ];

    protected $hidden = [
        'password',
    ];

    // Implement JWT methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
