<?php

namespace ProcessMaker\Model;

use Illuminate\Database\Eloquent\Model;
use stdClass;

class UserConfig extends Model
{
    /**
     * Bind table.
     * @var string
     */
    protected $table = 'USER_CONFIG';

    /**
     * Column timestamps.
     * @var boolean
     */
    public $timestamps = false;

    /**
     * Get user setting.
     * @param int $id
     * @param string $name
     * @return mix array|null
     */
    public static function getSetting(int $id, string $name)
    {
        $userConfig = UserConfig::where('USR_ID', '=', $id)
            ->where('USC_NAME', '=', $name)
            ->get()
            ->first();
        if (empty($userConfig)) {
            return null;
        }
        $setting = json_decode($userConfig->USC_SETTING);
        if (empty($setting)) {
            $setting = new stdClass();
        }
        return [
            "id" => $userConfig->USR_ID,
            "name" => $userConfig->USC_NAME,
            "setting" => $setting
        ];
    }

    /**
     * Add user setting.
     * @param int $id
     * @param string $name
     * @param array $setting
     * @return mix array|null
     */
    public static function addSetting(int $id, string $name, array $setting)
    {
        $model = new UserConfig();
        $model->USR_ID = $id;
        $model->USC_NAME = $name;
        $model->USC_SETTING = json_encode($setting);
        $model->save();
        $userConfig = UserConfig::getSetting($id, $name);
        return $userConfig;
    }

    /**
     * Edit user setting.
     * @param int $id
     * @param string $name
     * @param array $setting
     * @return mix array|null
     */
    public static function editSetting(int $id, string $name, array $setting)
    {
        UserConfig::where('USR_ID', '=', $id)
            ->where('USC_NAME', '=', $name)
            ->update(["USC_SETTING" => json_encode($setting)]);

        return UserConfig::getSetting($id, $name);
    }

    /**
     * Delete user setting.
     * @param int $id
     * @param string $name
     * @return mix array|null
     */
    public static function deleteSetting(int $id, string $name)
    {
        $userConfig = UserConfig::getSetting($id, $name);
        UserConfig::where('USR_ID', '=', $id)
            ->where('USC_NAME', '=', $name)
            ->delete();
        return $userConfig;
    }
}
