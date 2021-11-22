<?php

namespace ProcessMaker\Model;

use Illuminate\Database\Eloquent\Model;

class UserExtendedAttributes extends Model
{
    protected $table = "USER_EXTENDED_ATTRIBUTES";
    protected $primaryKey = "UEA_ID";
    public $incrementing = true;
    public $timestamps = false;

}
