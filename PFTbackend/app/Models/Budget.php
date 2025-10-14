<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $primaryKey = 'budget_id';

    protected $fillable = [
        'user_id',
        'category',
        'amount',
        'start_date',
        'end_date',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 👇 Add this
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'budget_id', 'budget_id');
    }
}
