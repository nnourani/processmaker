<?php

namespace ProcessMaker\Model;

use Illuminate\Database\Eloquent\Model;

class RbacUsersRoles extends Model
{
    protected $table = 'RBAC_USERS_ROLES';
    public $timestamps = false;

    /**
     * Assign rol to user
     * 
     * @param string $userUid
     * @param string $rolUid
     * 
     * @return void
     */
    public static function assignRolToUser($userUid, $rolUid)
    {
        RbacUsersRoles::insert([
            'USR_UID' => $userUid,
            'ROL_UID' => $rolUid
        ]);
    }
}
