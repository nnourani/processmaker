<?php

namespace ProcessMaker\Model;

use Illuminate\Database\Eloquent\Model;

class RbacRoles extends Model
{
    protected $table = 'RBAC_ROLES';
    public $timestamps = false;

    /**
     * Get rol Uid by code
     * 
     * @param string $rolCode
     * 
     * @return array
     */
    public static function getRolUidByCode($rolCode)
    {
        $query = RbacRoles::select('ROL_UID')->where('ROL_CODE', $rolCode);
        $query = $query->get()->first();
        
        if (is_null($query)) {
            return [];
        } else {
            return $query->toArray();
        }
    }
}
