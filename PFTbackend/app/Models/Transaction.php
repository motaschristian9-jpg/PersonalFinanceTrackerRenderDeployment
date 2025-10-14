<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    // Primary key
    protected $primaryKey = 'transaction_id';

    // Auto-increment and type
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'budget_id',       // 👈 make sure budget_id is fillable
        'type',
        'category',
        'amount',
        'transaction_date',
        'description',
    ];

    // 👇 Relationships
    public function budget()
    {
        return $this->belongsTo(Budget::class, 'budget_id', 'budget_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
