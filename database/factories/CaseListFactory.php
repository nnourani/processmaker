<?php

use Faker\Generator as Faker;

$factory->define(\ProcessMaker\Model\CaseList::class, function (Faker $faker) {
    return [
        'CAL_ID' => $faker->unique()->numberBetween(1, 2000),
        'CAL_TYPE' => 'inbox',
        'CAL_NAME' => $faker->title,
        'CAL_DESCRIPTION' => $faker->text,
        'ADD_TAB_UID' => function () {
            $table = factory(\ProcessMaker\Model\AdditionalTables::class)->create();
            return $table->ADD_TAB_UID;
        },
        'CAL_COLUMNS' => '[]',
        'USR_ID' => function () {
            $user = factory(\ProcessMaker\Model\User::class)->create();
            return $user->USR_ID;
        },
        'CAL_ICON_LIST' => 'deafult.png',
        'CAL_ICON_COLOR' => 'red',
        'CAL_ICON_COLOR_SCREEN' => 'blue',
        'CAL_CREATE_DATE' => $faker->dateTime(),
        'CAL_UPDATE_DATE' => $faker->dateTime()
    ];
});
